import { createServerFn } from "@tanstack/react-start";
import crypto from "crypto";
import { dbQuery, withTransaction } from "./db.server";
import {
  createCashfreeOrder,
  getCashfreeOrder,
  getCashfreeOrderPayments,
  getCashfreeConfig,
  type CashfreeCustomerDetails,
} from "./cashfree.server";
import { checkIsAdmin, checkAllTasksVerified } from "./fee-service.server";
import { generateCertId, getDomain } from "./constants";

export interface CashfreeOrderRecord {
  id: string;
  order_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_service: string;
  product_type: string;
  entity_id: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  cashfree_payment_id: string | null;
  cf_order_id: string | null;
  payment_session_id: string | null;
  payment_method: string | null;
  payment_time: string | null;
  error_message: string | null;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Public config check for client SDK initialization
 */
export const getCashfreePublicConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    const cfg = getCashfreeConfig();
    return {
      environment: cfg.environment as "SANDBOX" | "PRODUCTION",
      apiVersion: cfg.apiVersion,
    };
  }
);

/**
 * Create a new Cashfree payment order (Strict server-side pricing).
 */
export const createPaymentOrderServer = createServerFn({ method: "POST" })
  .validator(
    (d: {
      userId?: string | null;
      applicationId?: string | null;
      courseId?: string | null;
      productType: "certificate" | "application" | "course" | "custom";
      productService?: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      couponCode?: string | null;
      returnUrl?: string | null;
    }) => d
  )
  .handler(async ({ data }) => {
    const {
      userId,
      applicationId,
      courseId,
      productType,
      customerName,
      customerEmail,
      customerPhone,
      couponCode,
      returnUrl: rawReturnUrl,
    } = data;

    let returnUrl: string | undefined = undefined;
    if (rawReturnUrl && typeof rawReturnUrl === "string") {
      try {
        const parsed = new URL(rawReturnUrl);
        const host = parsed.hostname.toLowerCase();
        if (
          host === "skyrovix.online" ||
          host === "www.skyrovix.online" ||
          host === "skyrovix.in" ||
          host === "www.skyrovix.in" ||
          host === "localhost" ||
          host === "127.0.0.1"
        ) {
          returnUrl = rawReturnUrl;
        }
      } catch {
        // Ignore and let default handle it
      }
    }

    if (!customerEmail || !customerName) {
      throw new Error("Customer name and email are required to generate an order");
    }

    // 1. Calculate price securely on server (Never trust client amount)
    let calculatedAmount = 100; // Default ₹100 for certificate
    let discountAmount = 0;
    let serviceTitle = data.productService || "Skyrovix Service";

    if (productType === "certificate") {
      serviceTitle = "Skyrovix Verified Internship Certificate Fee";

      if (applicationId) {
        // Strict check: Task verification check
        const taskCheck = await checkAllTasksVerified(null, applicationId);
        if (!taskCheck.isCompleted) {
          throw new Error(
            `Certificate payment is LOCKED: You have ${taskCheck.approvedCount} of ${taskCheck.requiredCount} tasks approved (missing tasks: ${taskCheck.missingTaskNumbers.join(", ")}). Admin must approve all required tasks first.`
          );
        }

        // Get application domain for title
        const appRes = await dbQuery(
          "SELECT domain, course FROM public.applications WHERE id = $1",
          [applicationId]
        );
        if (appRes.rows.length > 0) {
          const d = appRes.rows[0];
          serviceTitle = `Skyrovix Certificate — ${d.domain || d.course || "Internship"}`;
        }
      }

      // Read fee settings
      const feeRes = await dbQuery(
        "SELECT amount, is_enabled, offer_enabled, offer_amount FROM public.fee_settings WHERE fee_type = 'certificate'"
      );
      if (feeRes.rows.length > 0) {
        const row = feeRes.rows[0];
        calculatedAmount = Number(row.amount ?? 100);
      }

      // Apply coupon discount if provided
      if (couponCode && couponCode.trim()) {
        const cRes = await dbQuery(
          "SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1) AND is_active = true",
          [couponCode.trim()]
        );
        if (cRes.rows.length > 0) {
          const c = cRes.rows[0];
          if (
            c.discount_type === "free" ||
            (c.discount_type === "percentage" && Number(c.discount_value) >= 100)
          ) {
            discountAmount = calculatedAmount;
          } else if (c.discount_type === "percentage") {
            discountAmount = (calculatedAmount * Number(c.discount_value)) / 100;
          } else {
            discountAmount = Number(c.discount_value);
          }
          if (discountAmount > calculatedAmount) discountAmount = calculatedAmount;
          calculatedAmount = Math.max(0, calculatedAmount - discountAmount);
        }
      }

      if (calculatedAmount <= 0) {
        throw new Error(
          "The payable amount is ₹0 after discounts. Please use the free waiver claim instead of payment gateway."
        );
      }
    } else if (productType === "application") {
      serviceTitle = "Skyrovix Internship Application Fee";
      const feeRes = await dbQuery(
        "SELECT amount FROM public.fee_settings WHERE fee_type = 'application'"
      );
      calculatedAmount = Number(feeRes.rows[0]?.amount ?? 0);
      if (calculatedAmount <= 0) {
        throw new Error("Application fee is currently free.");
      }
    } else if (productType === "course" && courseId) {
      const courseRes = await dbQuery(
        "SELECT title, price FROM public.courses WHERE id = $1",
        [courseId]
      );
      if (courseRes.rows.length > 0) {
        serviceTitle = `Course: ${courseRes.rows[0].title}`;
        calculatedAmount = Number(courseRes.rows[0].price ?? 499);
      }
    }

    // 2. Generate unique order ID
    const sanitizedPrefix = productType.toUpperCase().slice(0, 4);
    const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `SKY_${sanitizedPrefix}_${Date.now()}_${randSuffix}`;

    // 3. Prepare Customer Details
    const customerDetails: CashfreeCustomerDetails = {
      customer_id: userId ? `user_${userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30)}` : `cust_${Date.now()}`,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim(),
    };

    // 4. Create Cashfree Order via API
    const cfResponse = await createCashfreeOrder({
      orderId,
      orderAmount: calculatedAmount,
      orderCurrency: "INR",
      customerDetails,
      orderNote: serviceTitle,
      returnUrl,
    });

    if (!cfResponse.payment_session_id) {
      throw new Error("Failed to receive payment session from Cashfree");
    }

    // 5. Store record in database
    await dbQuery(
      `INSERT INTO public.cashfree_orders (
        order_id, user_id, customer_name, customer_email, customer_phone,
        product_service, product_type, entity_id, amount, currency,
        payment_status, cf_order_id, payment_session_id, coupon_code,
        discount_amount, raw_response, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'INR', 'CREATED', $10, $11, $12, $13, $14, now(), now())`,
      [
        orderId,
        userId || null,
        customerName.trim(),
        customerEmail.trim(),
        customerPhone.trim(),
        serviceTitle,
        productType,
        applicationId || courseId || null,
        calculatedAmount,
        String(cfResponse.cf_order_id || ""),
        cfResponse.payment_session_id,
        couponCode?.trim() || null,
        discountAmount,
        JSON.stringify(cfResponse),
      ]
    );

    const cfg = getCashfreeConfig();

    return {
      success: true,
      orderId,
      paymentSessionId: cfResponse.payment_session_id,
      amount: calculatedAmount,
      currency: "INR",
      productService: serviceTitle,
      environment: cfg.environment as "SANDBOX" | "PRODUCTION",
      customerDetails,
    };
  });

/**
 * Server-side order verification.
 * Directly communicates with Cashfree API to verify and updates database idempotently.
 */
export const verifyPaymentOrderServer = createServerFn({ method: "POST" })
  .validator((d: { orderId: string }) => d)
  .handler(async ({ data }) => {
    const { orderId } = data;
    if (!orderId) {
      throw new Error("Order ID is required for verification");
    }

    // 1. Fetch current order from DB
    const dbRes = await dbQuery(
      "SELECT * FROM public.cashfree_orders WHERE order_id = $1",
      [orderId]
    );

    if (dbRes.rows.length === 0) {
      throw new Error(`Order ${orderId} not found in database`);
    }

    const existingOrder = dbRes.rows[0];

    // If already verified and marked PAID, return cached verified status idempotently
    if (existingOrder.payment_status === "PAID" || existingOrder.payment_status === "SUCCESS") {
      // Self-healing: Ensure certificate is generated if missing for certificate order
      if (existingOrder.product_type === "certificate" && existingOrder.entity_id) {
        const certCheck = await dbQuery(
          "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
          [existingOrder.entity_id]
        );
        if (certCheck.rows.length === 0) {
          const certId = generateCertId();
          const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
          await dbQuery(
            `INSERT INTO public.certificates (application_id, certificate_id, verification_hash, issued_at)
             VALUES ($1, $2, $3, now())`,
            [existingOrder.entity_id, certId, hash]
          );
          await dbQuery(
            `UPDATE public.applications
             SET certificate_payment_status = 'approved',
                 certificate_payment_unlocked = true,
                 certificate_generated = true,
                 certificate_generated_at = COALESCE(certificate_generated_at, now()),
                 status = 'completed',
                 submission_status = 'approved',
                 verified = true,
                 verified_at = COALESCE(verified_at, now()),
                 all_tasks_verified = true,
                 updated_at = now()
             WHERE id = $1`,
            [existingOrder.entity_id]
          );
        }
      }
      return {
        success: true,
        orderId,
        status: "PAID",
        order: existingOrder,
        isAlreadyProcessed: true,
      };
    }

    // 2. Query Cashfree API directly for ground truth
    const cfOrder = await getCashfreeOrder(orderId);
    const cfPayments = await getCashfreeOrderPayments(orderId);

    const successfulPayment = cfPayments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    const isPaid =
      cfOrder.order_status === "PAID" ||
      successfulPayment?.payment_status === "SUCCESS";

    let newStatus = "PENDING";
    if (isPaid) {
      newStatus = "PAID";
    } else if (cfOrder.order_status === "EXPIRED") {
      newStatus = "EXPIRED";
    } else {
      const failedPayment = cfPayments.find(
        (p) => p.payment_status === "FAILED" || p.payment_status === "CANCELLED"
      );
      if (failedPayment) {
        newStatus = failedPayment.payment_status === "CANCELLED" ? "CANCELLED" : "FAILED";
      }
    }

    const cfPaymentId = successfulPayment
      ? String(successfulPayment.cf_payment_id)
      : cfPayments[0]
      ? String(cfPayments[0].cf_payment_id)
      : null;

    const paymentMethod = successfulPayment
      ? successfulPayment.payment_group || JSON.stringify(successfulPayment.payment_method || {})
      : null;

    const paymentTime = successfulPayment?.payment_time || null;

    // 3. Update DB in a transaction
    return withTransaction(async (client) => {
      await client.query(
        `UPDATE public.cashfree_orders
         SET payment_status = $1,
             cashfree_payment_id = COALESCE($2, cashfree_payment_id),
             payment_method = COALESCE($3, payment_method),
             payment_time = COALESCE($4::timestamptz, payment_time),
             raw_response = $5,
             updated_at = now()
         WHERE order_id = $6`,
        [
          newStatus,
          cfPaymentId,
          paymentMethod,
          paymentTime,
          JSON.stringify({ cfOrder, cfPayments }),
          orderId,
        ]
      );

      let generatedCertId: string | null = null;
      let appForEmail: any = null;

      // If PAID, trigger relevant platform activations
      if (newStatus === "PAID") {
        if (existingOrder.product_type === "certificate" && existingOrder.entity_id) {
          const applicationId = existingOrder.entity_id;

          // 1. Check or generate certificate in public.certificates
          const existingCertRes = await client.query(
            "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
            [applicationId]
          );

          generatedCertId = existingCertRes.rows[0]?.certificate_id || null;
          if (!generatedCertId) {
            generatedCertId = generateCertId();
            const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

            await client.query(
              `INSERT INTO public.certificates (application_id, certificate_id, verification_hash, issued_at)
               VALUES ($1, $2, $3, now())`,
              [applicationId, generatedCertId, hash]
            );
          }

          // 2. Unlock certificate, approve payment, and complete application
          await client.query(
            `UPDATE public.applications
             SET certificate_payment_status = 'approved',
                 certificate_payment_unlocked = true,
                 certificate_generated = true,
                 certificate_generated_at = COALESCE(certificate_generated_at, now()),
                 status = 'completed',
                 submission_status = 'approved',
                 verified = true,
                 verified_at = COALESCE(verified_at, now()),
                 all_tasks_verified = true,
                 updated_at = now()
             WHERE id = $1`,
            [applicationId]
          );

          // 3. Add / update legacy payment_records for admin verification transparency
          await client.query(
            `INSERT INTO public.payment_records (
               user_id, application_id, payment_type, amount, utr_number, status, reviewed_at, admin_note
             ) VALUES ($1, $2, 'certificate', $3, $4, 'approved', now(), 'Verified instantly via Cashfree Payment Gateway')
             ON CONFLICT DO NOTHING`,
            [
              existingOrder.user_id,
              applicationId,
              existingOrder.amount,
              cfPaymentId || orderId,
            ]
          );

          // 4. Sync legacy payments table
          await client.query(
            `INSERT INTO public.payments (
               id, application_id, utr_number, amount, status, coupon_code, discount_amount, verified_at
             ) VALUES ($1, $2, $3, $4, 'verified', $5, $6, now())
             ON CONFLICT (application_id)
             DO UPDATE SET utr_number = EXCLUDED.utr_number, amount = EXCLUDED.amount, status = 'verified', verified_at = now()`,
            [
              existingOrder.id,
              applicationId,
              cfPaymentId || orderId,
              existingOrder.amount,
              existingOrder.coupon_code,
              existingOrder.discount_amount,
            ]
          );

          const appRes = await client.query(
            "SELECT * FROM public.applications WHERE id = $1",
            [applicationId]
          );
          appForEmail = appRes.rows[0];
        } else if (existingOrder.product_type === "application" && existingOrder.entity_id) {
          const applicationId = existingOrder.entity_id;
          await client.query(
            `UPDATE public.applications
             SET application_fee_status = 'approved',
                 status = 'approved',
                 offer_issued_at = COALESCE(offer_issued_at, now()),
                 updated_at = now()
             WHERE id = $1`,
            [applicationId]
          );

          await client.query(
            `INSERT INTO public.payment_records (
               user_id, application_id, payment_type, amount, utr_number, status, reviewed_at, admin_note
             ) VALUES ($1, $2, 'application', $3, $4, 'approved', now(), 'Verified instantly via Cashfree Payment Gateway')
             ON CONFLICT DO NOTHING`,
            [
              existingOrder.user_id,
              applicationId,
              existingOrder.amount,
              cfPaymentId || orderId,
            ]
          );

          const appRes = await client.query(
            "SELECT * FROM public.applications WHERE id = $1",
            [applicationId]
          );
          appForEmail = appRes.rows[0];
        }
      }

      const updatedRes = await client.query(
        "SELECT * FROM public.cashfree_orders WHERE order_id = $1",
        [orderId]
      );

      // Async email notification outside transaction
      if (newStatus === "PAID" && appForEmail) {
        if (existingOrder.product_type === "certificate" && generatedCertId) {
          const targetEmail = (appForEmail.email || "").trim() || (existingOrder.customer_email || "").trim();
          if (targetEmail) {
            import("@/lib/email-helpers").then(async ({ sendCertificateEmail }) => {
              const domainName = getDomain(appForEmail.domain)?.name ?? appForEmail.domain ?? "Internship Track";
              const emailRes = await sendCertificateEmail({
                to: targetEmail,
                studentName: appForEmail.full_name || existingOrder.customer_name,
                studentId: appForEmail.user_id || existingOrder.user_id || "",
                certId: generatedCertId!,
                domainName,
                internId: appForEmail.intern_id || "SKX-INTERN",
              });
              if (emailRes.success) {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'sent', email_sent_at = now(), email_error = null WHERE id = $1",
                  [appForEmail.id]
                );
              } else {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'failed', email_error = $1 WHERE id = $2",
                  [emailRes.error || "Email delivery failed", appForEmail.id]
                );
              }
            }).catch((err) => console.error("[Cashfree verify] Certificate email error:", err));
          }
        } else if (existingOrder.product_type === "application") {
          const targetEmail = (appForEmail.email || "").trim() || (existingOrder.customer_email || "").trim();
          if (targetEmail) {
            import("@/lib/email-helpers").then(async ({ sendOfferLetterEmail }) => {
              const emailRes = await sendOfferLetterEmail({
                to: targetEmail,
                studentName: appForEmail.full_name || existingOrder.customer_name,
                studentId: appForEmail.user_id || existingOrder.user_id || "",
                internId: appForEmail.intern_id || "SKX-INTERN",
                domainName: appForEmail.domain || "Internship Track",
                duration: appForEmail.duration || 1,
              });
              if (emailRes.success) {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'sent', email_sent_at = now(), email_error = null WHERE id = $1",
                  [appForEmail.id]
                );
              } else {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'failed', email_error = $1 WHERE id = $2",
                  [emailRes.error || "Email delivery failed", appForEmail.id]
                );
              }
            }).catch((err) => console.error("[Cashfree verify] Offer letter email error:", err));
          }
        }
      }

      return {
        success: true,
        orderId,
        status: newStatus,
        order: updatedRes.rows[0],
        certificateId: generatedCertId,
        isPaid,
      };
    });
  });

/**
 * Admin: Fetch Cashfree orders with search and pagination
 */
export const getAdminCashfreeOrdersServer = createServerFn({ method: "POST" })
  .validator(
    (d: {
      adminId: string;
      statusFilter?: string;
      searchQuery?: string;
      limit?: number;
      offset?: number;
    }) => d
  )
  .handler(async ({ data }) => {
    const { adminId, statusFilter = "all", searchQuery = "", limit = 50, offset = 0 } = data;
    const isAdmin = await checkIsAdmin(adminId);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const whereConditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (statusFilter && statusFilter !== "all") {
      const upperStatus = statusFilter.toUpperCase();
      if (upperStatus === "PENDING") {
        whereConditions.push(`payment_status IN ('PENDING', 'CREATED')`);
      } else if (upperStatus === "PAID") {
        whereConditions.push(`payment_status IN ('PAID', 'SUCCESS')`);
      } else if (upperStatus === "FAILED") {
        whereConditions.push(`payment_status IN ('FAILED', 'CANCELLED', 'EXPIRED')`);
      } else {
        whereConditions.push(`payment_status = $${pIdx++}`);
        params.push(upperStatus);
      }
    }

    if (searchQuery && searchQuery.trim()) {
      whereConditions.push(
        `(order_id ILIKE $${pIdx} OR customer_name ILIKE $${pIdx} OR customer_email ILIKE $${pIdx} OR customer_phone ILIKE $${pIdx} OR cashfree_payment_id ILIKE $${pIdx})`
      );
      params.push(`%${searchQuery.trim()}%`);
      pIdx++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const countRes = await dbQuery(
      `SELECT count(*)::int as total FROM public.cashfree_orders ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total ?? 0;

    // Fetch stats
    const statsRes = await dbQuery(`
      SELECT 
        count(*) filter (where payment_status IN ('PAID', 'SUCCESS'))::int as paid_count,
        coalesce(sum(amount) filter (where payment_status IN ('PAID', 'SUCCESS')), 0)::numeric as total_paid_amount,
        count(*) filter (where payment_status IN ('PENDING', 'CREATED'))::int as pending_count,
        count(*) filter (where payment_status IN ('FAILED', 'CANCELLED', 'EXPIRED'))::int as failed_count,
        count(*)::int as total_orders
      FROM public.cashfree_orders
    `);

    const listRes = await dbQuery(
      `SELECT * FROM public.cashfree_orders
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${pIdx++} OFFSET $${pIdx++}`,
      [...params, limit, offset]
    );

    return {
      orders: listRes.rows as CashfreeOrderRecord[],
      total,
      stats: statsRes.rows[0],
    };
  });

/**
 * Admin: Live Sync an order with Cashfree
 */
export const syncCashfreeOrderAdminServer = createServerFn({ method: "POST" })
  .validator((d: { adminId: string; orderId: string }) => d)
  .handler(async ({ data }) => {
    const isAdmin = await checkIsAdmin(data.adminId);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return verifyPaymentOrderServer({ data: { orderId: data.orderId } });
  });
