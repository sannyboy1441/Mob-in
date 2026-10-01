// =====================================================================
// MOB'IN PLATFORM: UNIT LIMIT ENFORCEMENT MIDDLEWARE
// Prevents landlords from exceeding their subscribed unit cap
// =====================================================================

import { supabase } from "../../src/supabaseClient.js";

/**
 * Access Control Middleware: Enforces subscription status & property unit cap
 * Runs before POST /api/v1/properties or property publishing
 */
export async function enforceUnitLimit(req, res, next) {
  try {
    const landlordId = req.user?.id || req.body?.landlord_id;
    const landlordEmail = req.user?.email || req.body?.landlord_email;

    if (!landlordId && !landlordEmail) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required to publish properties.",
      });
    }

    // 1. Fetch Landlord Subscription & Plan
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .or(`landlord_id.eq.${landlordId},landlord_email.eq.${landlordEmail}`)
      .maybeSingle();

    const plan = subData?.plans || { name: "Landlord Starter", unit_limit: 1 };
    const status = subData?.status || "active";
    const unitLimit = Number(plan.unit_limit || 1);

    // 2. Validate Subscription Status
    const isAllowedStatus = ["active", "free_trial", "comped_partner"].includes(status);
    if (!isAllowedStatus) {
      return res.status(403).json({
        success: false,
        error: "Subscription Inactive",
        code: "SUBSCRIPTION_STATUS_INVALID",
        status: status,
        message: `Your subscription is currently '${status}'. Please renew your plan to publish properties.`,
        plan_name: plan.name,
      });
    }

    // 3. Count Active Listings in Database
    const { count, error: countError } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .or(`landlord_id.eq.${landlordId},landlord_email.eq.${landlordEmail}`)
      .neq("status", "Archived");

    const currentCount = count || 0;

    // 4. Enforce Cap
    if (currentCount >= unitLimit) {
      return res.status(403).json({
        success: false,
        error: "Subscription Limit Exceeded",
        code: "UNIT_LIMIT_EXCEEDED",
        message: `You have reached the maximum listing limit (${unitLimit} ${unitLimit === 1 ? "unit" : "units"}) on your ${plan.name}. Please upgrade to list more properties.`,
        unit_limit: unitLimit,
        active_properties_count: currentCount,
        plan_name: plan.name,
        can_upgrade: true,
      });
    }

    // Attach validated subscription quota to request context
    req.subscriptionQuota = {
      planName: plan.name,
      unitLimit,
      currentCount,
      remainingSlots: unitLimit - currentCount,
    };

    next();
  } catch (err) {
    console.error("enforceUnitLimit error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to verify subscription listing allowance.",
    });
  }
}
