/**
 * Cashfree Client-Side Checkout Helper (v3 JS SDK)
 * Dynamically loads https://sdk.cashfree.com/js/v3/cashfree.js
 * and initializes Cashfree checkout with paymentSessionId.
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_modal";
      }) => Promise<{ error?: { message: string }; redirect?: boolean }>;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

export function loadCashfreeScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree checkout can only be loaded in browser"));
  }

  if (window.Cashfree) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="cashfree.com/js/v3/cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("Failed to load Cashfree payment gateway SDK. Please check your network."));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function launchCashfreeCheckout(params: {
  paymentSessionId: string;
  environment?: "SANDBOX" | "PRODUCTION";
  redirectTarget?: "_self" | "_blank" | "_modal";
}): Promise<void> {
  const { paymentSessionId, environment = "SANDBOX", redirectTarget = "_self" } = params;

  if (!paymentSessionId) {
    throw new Error("Missing Cashfree payment session ID");
  }

  await loadCashfreeScript();

  if (!window.Cashfree) {
    throw new Error("Cashfree SDK failed to initialize");
  }

  const mode = environment.toLowerCase() === "production" ? "production" : "sandbox";
  const cashfree = window.Cashfree({ mode });

  const result = await cashfree.checkout({
    paymentSessionId,
    redirectTarget,
  });

  if (result?.error) {
    throw new Error(result.error.message || "Payment checkout error");
  }
}
