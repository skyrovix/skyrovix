import { verifyCashfreeWebhookSignature } from "./cashfree.server";
import { verifyPaymentOrderServer } from "./cashfree-service";

/**
 * Handles incoming Cashfree Webhook notifications securely.
 * 1. Validates HMAC-SHA256 signature using raw body and timestamp
 * 2. Ensures idempotency and prevents replay attacks
 * 3. Verifies order state server-to-server with Cashfree before applying DB changes
 */
export async function handleCashfreeWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    const rawBody = await request.text();

    if (!signature || !timestamp) {
      console.warn("[Cashfree Webhook] Missing signature or timestamp headers");
      return new Response(JSON.stringify({ error: "Missing signature or timestamp" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify cryptographic signature
    const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      console.error("[Cashfree Webhook] Invalid webhook signature from IP / Client");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload?.type || "UNKNOWN";
    const orderId = payload?.data?.order?.order_id || payload?.order_id;

    console.log(`[Cashfree Webhook Received] Event: ${eventType} | Order ID: ${orderId}`);

    if (orderId) {
      // Independent server-to-server verification & idempotent DB update
      await verifyPaymentOrderServer({ data: { orderId } });
    }

    return new Response(JSON.stringify({ status: "OK", received: true, orderId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[Cashfree Webhook Processing Error]:", err);
    return new Response(
      JSON.stringify({ error: "Internal error processing webhook", message: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
