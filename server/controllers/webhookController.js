// =====================================================================
// MOB'IN PLATFORM: PAYMENT GATEWAY WEBHOOK CONTROLLER
// Handles payment.succeeded, payment.failed (3-day grace period), & cancellation
// =====================================================================

import { supabase } from "../../src/supabaseClient.js";

/**
 * Webhook Handler for Payment Gateways (GCash, Maya, QR Ph, Card / PayMongo / Xendit / Stripe)
 * POST /api/v1/webhooks/payment
 */
export async function handlePaymentWebhook(req, res) {
  try {
    const { event, data } = req.body || {};

    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: "Invalid Webhook Payload",
        message: "Missing event type or payload data.",
      });
    }

    const {
      landlord_id,
      landlord_email,
      subscription_id,
      plan_id,
      amount,
      payment_channel = "gcash",
      gateway_reference,
    } = data;

    const now = new Date();

    switch (event) {
      case "payment.succeeded": {
        // 1. Calculate Period Extension (30 days default)
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // 2. Transition state to 'active', clear grace period
        const { data: updatedSub, error: subErr } = await supabase
          .from("subscriptions")
          .upsert([
            {
              id: subscription_id,
              landlord_id: landlord_id,
              landlord_email: landlord_email,
              plan_id: plan_id || "starter",
              status: "active",
              auto_renew: true,
              payment_channel: payment_channel,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              grace_period_deadline: null,
              gateway_subscription_id: gateway_reference || `PM-${payment_channel.toUpperCase()}-${Date.now()}`,
              updated_at: now.toISOString(),
            },
          ])
          .select()
          .single();

        if (subErr) console.warn("Supabase sub update warning:", subErr.message);

        // 3. Generate Official BIR Invoice
        const orNumber = `OR-${Math.floor(100000 + Math.random() * 900000)}`;
        const invoiceId = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from("invoices").insert([
          {
            id: invoiceId,
            subscription_id: updatedSub?.id || subscription_id,
            landlord_id,
            or_number: orNumber,
            amount: Number(amount || 299),
            vat_amount: Number(((amount || 299) * 0.12).toFixed(2)),
            status: "paid",
            payment_channel: payment_channel,
            paid_at: now.toISOString(),
          },
        ]);

        // 4. Log Audit Trail
        await supabase.from("subscription_audit_logs").insert([
          {
            admin_id: "GATEWAY_WEBHOOK",
            admin_email: "webhook@gateway.mobin.ph",
            action_type: "payment_success",
            target_landlord_id: landlord_id,
            target_landlord_email: landlord_email || "",
            previous_status: "pending",
            new_status: "active",
            reason: `Automated webhook confirmed recurring payment of ₱${amount || 299} via ${payment_channel.toUpperCase()}`,
          },
        ]);

        return res.status(200).json({
          success: true,
          event: "payment.succeeded",
          status: "active",
          subscription: updatedSub,
        });
      }

      case "payment.failed": {
        // Payment failed -> 3-day Grace Period State Machine
        const graceDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const { data: graceSub, error: graceErr } = await supabase
          .from("subscriptions")
          .update({
            status: "grace_period",
            grace_period_deadline: graceDeadline.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("landlord_id", landlord_id)
          .select()
          .single();

        // Log failed invoice
        const failedInvoiceId = `INV-FAIL-${Date.now()}`;
        await supabase.from("invoices").insert([
          {
            id: failedInvoiceId,
            subscription_id: graceSub?.id || subscription_id,
            landlord_id,
            or_number: "UNPAID",
            amount: Number(amount || 299),
            status: "failed",
            payment_channel: payment_channel,
          },
        ]);

        // Audit log
        await supabase.from("subscription_audit_logs").insert([
          {
            admin_id: "GATEWAY_WEBHOOK",
            admin_email: "webhook@gateway.mobin.ph",
            action_type: "payment_failed_grace_period",
            target_landlord_id: landlord_id,
            target_landlord_email: landlord_email || "",
            previous_status: "active",
            new_status: "grace_period",
            reason: `Payment attempt failed via ${payment_channel}. 3-Day Grace Period initiated until ${graceDeadline.toLocaleDateString()}.`,
          },
        ]);

        return res.status(200).json({
          success: true,
          event: "payment.failed",
          status: "grace_period",
          grace_period_deadline: graceDeadline.toISOString(),
          message: "Landlord moved to 3-day grace period before account freezing.",
        });
      }

      case "subscription.cancelled": {
        const { data: cancelSub } = await supabase
          .from("subscriptions")
          .update({
            auto_renew: false,
            status: "cancelled",
            updated_at: now.toISOString(),
          })
          .eq("landlord_id", landlord_id)
          .select()
          .single();

        await supabase.from("subscription_audit_logs").insert([
          {
            admin_id: "USER_INITIATED",
            admin_email: landlord_email || "user@mobin.ph",
            action_type: "subscription_cancelled",
            target_landlord_id: landlord_id,
            target_landlord_email: landlord_email || "",
            previous_status: "active",
            new_status: "cancelled",
            reason: "Landlord toggled off recurring auto-billing.",
          },
        ]);

        return res.status(200).json({
          success: true,
          event: "subscription.cancelled",
          status: "cancelled",
          subscription: cancelSub,
        });
      }

      default:
        return res.status(400).json({
          success: false,
          error: "Unhandled Event",
          message: `Webhook event '${event}' is not supported.`,
        });
    }
  } catch (err) {
    console.error("handlePaymentWebhook error:", err);
    return res.status(500).json({
      success: false,
      error: "Webhook Processing Error",
      message: err.message,
    });
  }
}
