// =====================================================================
// MOB'IN PLATFORM: SUBSCRIPTION API CONTROLLERS
// Landlord & Super Admin Business Logic & DB Transactions
// =====================================================================

import { supabase } from "../../src/supabaseClient.js";

/**
 * 1. GET ALL ACTIVE PLANS (GET /api/v1/subscriptions/plans)
 */
export async function getPlans(req, res) {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      plans: data,
    });
  } catch (err) {
    console.error("getPlans error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch subscription plans",
      message: err.message,
    });
  }
}

/**
 * 2. GET CURRENT LANDLORD SUBSCRIPTION (GET /api/v1/subscriptions/me)
 */
export async function getMySubscription(req, res) {
  try {
    const landlordId = req.query.landlord_id || req.user?.id;
    const landlordEmail = req.query.landlord_email || req.user?.email;

    if (!landlordId && !landlordEmail) {
      return res.status(400).json({
        success: false,
        error: "Missing landlord identifier parameters.",
      });
    }

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .or(`landlord_id.eq.${landlordId},landlord_email.eq.${landlordEmail}`)
      .maybeSingle();

    if (subError) throw subError;

    // Fetch active property count for usage tracking
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .or(`landlord_id.eq.${landlordId},landlord_email.eq.${landlordEmail}`);

    const currentPropertiesCount = count || 0;
    const plan = sub?.plans || null;
    const unitLimit = plan?.unit_limit || 1;

    return res.status(200).json({
      success: true,
      subscription: sub || null,
      plan: plan,
      usage: {
        active_properties_count: currentPropertiesCount,
        unit_limit: unitLimit,
        remaining_slots: Math.max(0, unitLimit - currentPropertiesCount),
        percentage_used: Math.min(100, Math.round((currentPropertiesCount / unitLimit) * 100)),
        is_limit_reached: currentPropertiesCount >= unitLimit,
      },
    });
  } catch (err) {
    console.error("getMySubscription error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch landlord subscription details",
      message: err.message,
    });
  }
}

/**
 * 3. CREATE CHECKOUT SESSION (POST /api/v1/subscriptions/checkout-session)
 */
export async function createCheckoutSession(req, res) {
  try {
    const {
      landlord_id,
      landlord_email,
      landlord_name,
      plan_id,
      billing_interval = "monthly",
      payment_channel = "gcash",
      tin,
    } = req.body;

    if (!landlord_id || !plan_id) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "landlord_id and plan_id are mandatory.",
      });
    }

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({
        success: false,
        error: "Plan Not Found",
        message: `Subscription tier '${plan_id}' does not exist.`,
      });
    }

    const price = billing_interval === "annual" ? Number(plan.annual_price) : Number(plan.price);
    const gatewayRef = `PM-${payment_channel.toUpperCase()}-${Date.now()}`;
    const now = new Date();
    const periodEnd = new Date(
      now.getTime() + (billing_interval === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000
    );

    // Upsert subscription
    const { data: subData, error: subUpsertErr } = await supabase
      .from("subscriptions")
      .upsert([
        {
          landlord_id,
          landlord_email: landlord_email || "landlord@mobin.ph",
          landlord_name: landlord_name || "Juan Dela Cruz",
          plan_id: plan.id,
          status: "active",
          payment_channel: payment_channel,
          gateway_subscription_id: gatewayRef,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          grace_period_deadline: null,
          auto_renew: true,
          updated_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (subUpsertErr) throw subUpsertErr;

    // Create official receipt invoice record
    const orNumber = `OR-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceId = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: invoiceData } = await supabase
      .from("invoices")
      .insert([
        {
          id: invoiceId,
          subscription_id: subData.id,
          landlord_id,
          or_number: orNumber,
          amount: price,
          vat_amount: Number((price * 0.12).toFixed(2)),
          status: "paid",
          payment_channel: payment_channel,
          paid_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    return res.status(201).json({
      success: true,
      checkout_session_id: gatewayRef,
      checkout_url: `https://pay.mobin.ph/checkout/${gatewayRef}`,
      subscription: subData,
      invoice: invoiceData || { id: invoiceId, or_number: orNumber, amount: price },
    });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return res.status(500).json({
      success: false,
      error: "Checkout Initiation Failed",
      message: err.message,
    });
  }
}

/**
 * 4. CANCEL / DISABLE AUTO-RENEWAL (POST /api/v1/subscriptions/cancel)
 */
export async function cancelSubscription(req, res) {
  try {
    const { landlord_id, reason = "User requested cancellation" } = req.body;

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        auto_renew: false,
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("landlord_id", landlord_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Subscription auto-renewal disabled. Your listings will stay active until the current period ends.",
      subscription: data,
    });
  } catch (err) {
    console.error("cancelSubscription error:", err);
    return res.status(500).json({
      success: false,
      error: "Cancellation Failed",
      message: err.message,
    });
  }
}

/**
 * 5. ADMIN UPSERT PLAN (POST /api/v1/admin/plans)
 */
export async function adminUpsertPlan(req, res) {
  try {
    const planPayload = req.body;
    const adminUser = req.user || { id: "admin-001", email: "admin@mobin.ph" };

    if (!planPayload.id || !planPayload.name || planPayload.price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Plan ID, Name, and Price are required fields.",
      });
    }

    const { data, error } = await supabase
      .from("plans")
      .upsert([
        {
          id: planPayload.id,
          name: planPayload.name,
          category: planPayload.category || "Landlord",
          price: Number(planPayload.price),
          annual_price: Number(planPayload.annual_price || planPayload.price * 10),
          billing_interval: planPayload.billing_interval || "monthly",
          unit_limit: Number(planPayload.unit_limit || 1),
          is_popular: !!planPayload.is_popular,
          is_active: planPayload.is_active ?? true,
          badge: planPayload.badge || "",
          description: planPayload.description || "",
          features: planPayload.features || [],
          feature_flags: planPayload.feature_flags || {},
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Log configuration in audit logs
    await supabase.from("subscription_audit_logs").insert([
      {
        admin_id: adminUser.id,
        admin_email: adminUser.email,
        action_type: "plan_configured",
        target_landlord_id: "SYSTEM",
        target_landlord_email: "SYSTEM_CONFIG",
        previous_status: "active",
        new_status: "active",
        reason: `Configured plan tier '${planPayload.name}' (Price: ₱${planPayload.price}, Limit: ${planPayload.unit_limit})`,
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Plan configured and synced across platform.",
      plan: data,
    });
  } catch (err) {
    console.error("adminUpsertPlan error:", err);
    return res.status(500).json({
      success: false,
      error: "Plan Save Failed",
      message: err.message,
    });
  }
}

/**
 * 6. ADMIN SUBSCRIPTION OVERRIDE (POST /api/v1/admin/subscriptions/override)
 * Atomic Stored Procedure Execution with Compulsory Reason Audit
 */
export async function adminOverrideSubscription(req, res) {
  try {
    const {
      landlord_id,
      landlord_email,
      new_status,
      extended_until,
      reason,
    } = req.body;

    const adminUser = req.user || { id: "admin-001", email: "admin@mobin.ph" };

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        code: "COMPULSORY_REASON_REQUIRED",
        message: "A mandatory rationale/reason (minimum 5 characters) must be supplied for audit tracking.",
      });
    }

    if (!landlord_id || !new_status) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "landlord_id and new_status are required.",
      });
    }

    // Call Atomic Database Stored Procedure
    const { data: rpcResult, error: rpcErr } = await supabase.rpc(
      "admin_override_subscription_tx",
      {
        p_admin_id: adminUser.id,
        p_admin_email: adminUser.email,
        p_target_landlord_id: landlord_id,
        p_target_landlord_email: landlord_email || "",
        p_new_status: new_status,
        p_extended_until: extended_until || null,
        p_reason: reason.trim(),
      }
    );

    if (rpcErr) throw rpcErr;

    return res.status(200).json({
      success: true,
      message: `Landlord subscription status successfully updated to '${new_status}'.`,
      result: rpcResult,
    });
  } catch (err) {
    console.error("adminOverrideSubscription error:", err);
    return res.status(500).json({
      success: false,
      error: "Override Transaction Failed",
      message: err.message,
    });
  }
}

/**
 * 7. SUBSCRIPTION ANALYTICS (GET /api/v1/admin/analytics/subscriptions)
 * MRR, Active Count, Grace Period Count, Churn
 */
export async function getSubscriptionAnalytics(req, res) {
  try {
    const { data: subs, error: subsErr } = await supabase
      .from("subscriptions")
      .select("status, payment_channel, plans(price, annual_price, billing_interval)");

    if (subsErr) throw subsErr;

    const totalSubscribers = subs.length;
    let mrr = 0;
    let activeCount = 0;
    let graceCount = 0;
    let expiredCount = 0;
    const channelMap = { gcash: 0, maya: 0, card: 0, qrph: 0 };

    subs.forEach((s) => {
      const price = Number(s.plans?.price || 299);
      if (s.status === "active") {
        activeCount++;
        mrr += price;
        if (channelMap[s.payment_channel] !== undefined) {
          channelMap[s.payment_channel] += price;
        }
      } else if (s.status === "grace_period") {
        graceCount++;
      } else if (s.status === "expired") {
        expiredCount++;
      }
    });

    return res.status(200).json({
      success: true,
      analytics: {
        mrr,
        arr: mrr * 12,
        total_subscribers: totalSubscribers,
        active_subscribers_count: activeCount,
        grace_period_count: graceCount,
        expired_count: expiredCount,
        churn_rate_percentage: totalSubscribers > 0 ? Number(((expiredCount / totalSubscribers) * 100).toFixed(1)) : 0,
        revenue_by_channel: channelMap,
      },
    });
  } catch (err) {
    console.error("getSubscriptionAnalytics error:", err);
    return res.status(500).json({
      success: false,
      error: "Analytics Computation Failed",
      message: err.message,
    });
  }
}

/**
 * 8. GET AUDIT LOGS (GET /api/v1/admin/audit-logs)
 */
export async function getAuditLogs(req, res) {
  try {
    const { data, error } = await supabase
      .from("subscription_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      audit_logs: data,
    });
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
      message: err.message,
    });
  }
}
