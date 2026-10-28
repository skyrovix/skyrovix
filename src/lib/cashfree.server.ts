import crypto from "node:crypto";
import { loadEnv } from "./env.server";

loadEnv();

const FALLBACK_CASHFREE_PROD_APP_ID = "14394481c7c769b9f0a9c04eec38449341";
const FALLBACK_CASHFREE_PROD_SECRET_KEY = "cfsk_ma_prod_d3b45e16d8c0d277fc90ae6e333e90aa_eb101bb7";

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: CashfreeCustomerDetails;
  returnUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string | number;
  order_id: string;
  order_currency: string;
  order_amount: number;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED" | string;
  payment_session_id?: string;
  order_expiry_time?: string;
  order_note?: string;
  message?: string;
  code?: string;
}

export interface CashfreePaymentItem {
  cf_payment_id: string | number;
  order_id: string;
  entity: string;
  payment_currency: string;
  payment_amount: number;
  payment_time: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED" | string;
  payment_message?: string;
  payment_group?: string;
  payment_method?: Record<string, any>;
  bank_reference?: string;
  auth_id?: string;
}

export function getCashfreeConfig() {
  loadEnv();
  const envRaw = (process.env.CASHFREE_ENVIRONMENT || "PRODUCTION").trim().toUpperCase();

  let appId = (
    process.env.CASHFREE_PROD_APP_ID ||
    process.env.CASHFREE_APP_ID ||
    ""
  ).trim();

  let secretKey = (
    process.env.CASHFREE_PROD_SECRET_KEY ||
    process.env.CASHFREE_SECRET_KEY ||
    ""
  ).trim();

  // If environment is explicitly defined as SANDBOX and sandbox keys exist
  if (envRaw === "SANDBOX" && process.env.CASHFREE_SANDBOX_APP_ID && process.env.CASHFREE_SANDBOX_SECRET_KEY) {
    appId = process.env.CASHFREE_SANDBOX_APP_ID.trim();
    secretKey = process.env.CASHFREE_SANDBOX_SECRET_KEY.trim();
  }

  // Automatic Fallback to official Skyrovix production credentials
  if (!appId || !secretKey) {
    appId = FALLBACK_CASHFREE_PROD_APP_ID;
    secretKey = FALLBACK_CASHFREE_PROD_SECRET_KEY;
  }

  // Key-type detection: Cashfree production secret keys start with "cfsk_ma_prod_"
  // and cannot authenticate on sandbox endpoint.
  const isProdKey = secretKey.startsWith("cfsk_ma_prod_") || secretKey.includes("_prod_");
  const isTestKey = secretKey.startsWith("cfsk_ma_test_") || secretKey.includes("_test_") || appId.startsWith("TEST");

  let isProd = true;
  if (isTestKey) {
    isProd = false;
  } else if (isProdKey) {
    isProd = true;
  } else {
    isProd = envRaw !== "SANDBOX";
  }

  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
  const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  return {
    environment: isProd ? ("PRODUCTION" as const) : ("SANDBOX" as const),
    appId,
    secretKey,
    apiVersion: apiVersion.trim(),
    baseUrl,
  };
}

export function getAppBaseUrl(): string {
  const envUrl = process.env.VITE_APP_URL || process.env.APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://www.skyrovix.online";
}

/**
 * Creates an order in Cashfree Payment Gateway (API v2023-08-01).
 * Returns payment_session_id required by frontend Cashfree JS SDK.
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
  const cfg = getCashfreeConfig();
  if (!cfg.appId || !cfg.secretKey) {
    throw new Error("Cashfree credentials missing in server environment");
  }

  // Sanitize customer phone number for Indian standards (10 digits)
  let cleanPhone = params.customerDetails.customer_phone.replace(/[^0-9]/g, "").slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    cleanPhone = "9999999999";
  }

  const appBaseUrl = getAppBaseUrl();
  const returnUrl = params.returnUrl || `${appBaseUrl}/payment/status?order_id={order_id}`;

  const payload = {
    order_id: params.orderId,
    order_amount: Number(params.orderAmount.toFixed(2)),
    order_currency: params.orderCurrency || "INR",
    customer_details: {
      customer_id: params.customerDetails.customer_id.slice(0, 50),
      customer_name: (params.customerDetails.customer_name || "Student").slice(0, 100),
      customer_email: params.customerDetails.customer_email.trim(),
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: returnUrl,
    },
    order_note: (params.orderNote || "Skyrovix Payment").slice(0, 200),
  };

  const response = await fetch(`${cfg.baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": cfg.appId,
      "x-client-secret": cfg.secretKey,
      "x-api-version": cfg.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as any;

  if (!response.ok) {
    console.error("[Cashfree Create Order Error]:", data);
    throw new Error(data?.message || `Cashfree order creation failed with status ${response.status}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches order details from Cashfree: GET /pg/orders/{order_id}
 */
export async function getCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  const cfg = getCashfreeConfig();
  const response = await fetch(`${cfg.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-client-id": cfg.appId,
      "x-client-secret": cfg.secretKey,
      "x-api-version": cfg.apiVersion,
    },
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    console.error(`[Cashfree Get Order Error for ${orderId}]:`, data);
    throw new Error(data?.message || `Failed to fetch Cashfree order (${response.status})`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches payment attempts for an order: GET /pg/orders/{order_id}/payments
 */
export async function getCashfreeOrderPayments(orderId: string): Promise<CashfreePaymentItem[]> {
  const cfg = getCashfreeConfig();
  const response = await fetch(`${cfg.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: "GET",
    headers: {
      "x-client-id": cfg.appId,
      "x-client-secret": cfg.secretKey,
      "x-api-version": cfg.apiVersion,
    },
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    console.error(`[Cashfree Get Payments Error for ${orderId}]:`, data);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

/**
 * Verifies webhook signature using HMAC-SHA256(timestamp + rawBody, secretKey)
 * Cashfree requires comparing the base64-encoded HMAC against x-webhook-signature header.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  if (!signature || !timestamp || !rawBody) {
    return false;
  }

  const cfg = getCashfreeConfig();
  if (!cfg.secretKey) {
    return false;
  }

  try {
    const payload = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", cfg.secretKey)
      .update(payload)
      .digest("base64");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const actualBuffer = Buffer.from(signature, "utf-8");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (err) {
    console.error("[Cashfree Webhook Signature Verification Error]:", err);
    return false;
  }
}
