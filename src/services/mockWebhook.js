// =====================================================================
// MOB'IN PLATFORM: MOCK PAYMENT GATEWAY WEBHOOK HARNESS
// PayMongo / GCash / Maya Webhook Event Payloads & Simulation
// =====================================================================

import { handlePaymentWebhook } from "./subscriptionService";

/**
 * 1. MOCK WEBHOOK PAYLOADS
 */
export const MOCK_WEBHOOK_PAYLOADS = {
  // Scenario A: Successful Recurring Charge (GCash / Card)
  PAYMENT_SUCCESS: {
    id: "evt_test_success_99812",
    eventType: "payment.success",
    created_at: new Date().toISOString(),
    landlordId: "landlord-001",
    landlordEmail: "sarah.jenkins@dorms.ph",
    paymentGatewayRef: "PM-GCASH-172627819000",
    data: {
      amount: 59900, // ₱599.00 in centavos
      currency: "PHP",
      fee: 0,
      source: {
        type: "gcash",
        account_number: "0917••••8829",
      },
      status: "paid",
      description: "Mob'in Landlord Portfolio - Monthly Subscription",
    },
  },

  // Scenario B: Payment Failed -> Trigger 3-Day Grace Period
  PAYMENT_FAILED: {
    id: "evt_test_failed_44312",
    eventType: "payment.failed",
    created_at: new Date().toISOString(),
    landlordId: "landlord-001",
    landlordEmail: "sarah.jenkins@dorms.ph",
    paymentGatewayRef: "PM-GCASH-172627819000",
    failureReason: "GCash Insufficient Balance on Recurring Auto-Debit (Code: INSUFFICIENT_FUNDS)",
    data: {
      amount: 59900,
      currency: "PHP",
      status: "failed",
      error_code: "insufficient_funds",
    },
  },

  // Scenario C: Landlord Subscription Cancelled
  SUBSCRIPTION_CANCELLED: {
    id: "evt_test_cancel_11029",
    eventType: "subscription.cancelled",
    created_at: new Date().toISOString(),
    landlordId: "landlord-001",
    landlordEmail: "sarah.jenkins@dorms.ph",
    paymentGatewayRef: "PM-GCASH-172627819000",
    data: {
      cancel_reason: "Customer requested pause",
    },
  },
};

/**
 * 2. TEST SIMULATOR FUNCTION
 */
export async function simulateWebhookEvent(eventKey = "PAYMENT_SUCCESS") {
  const payload = MOCK_WEBHOOK_PAYLOADS[eventKey];
  if (!payload) throw new Error(`Unknown mock webhook event key: ${eventKey}`);

  console.log(`[Webhook Simulator] Dispatching event '${payload.eventType}' for ${payload.landlordId}...`);
  const result = await handlePaymentWebhook(payload);
  console.log("[Webhook Simulator] Result:", result);
  return { payload, result };
}
