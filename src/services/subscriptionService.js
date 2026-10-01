// =====================================================================
// MOB'IN PLATFORM: SUBSCRIPTION SERVICE & ACCESS CONTROL MIDDLEWARE
// =====================================================================

import { supabase } from "../supabaseClient.js";

const LOCAL_STORAGE_KEYS = {
  PLANS: "mobin_subscription_plans",
  SUBSCRIPTIONS: "mobin_landlord_subscriptions",
  INVOICES: "mobin_subscription_invoices",
  AUDIT_LOGS: "mobin_subscription_audit_logs",
};

export function parseUnitLimit(propertiesLimit, fallback = 1) {
  if (typeof propertiesLimit === "number") return propertiesLimit;
  if (!propertiesLimit) return fallback;
  const str = String(propertiesLimit).trim().toLowerCase();
  if (str.includes("unlimited") || str.includes("infinite")) return 9999;
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
}

/**
 * DEFAULT SEED PLANS (Aligned with Admin Subscription Pricing)
 */
export const DEFAULT_PLANS = [
  {
    id: "plan-landlord-starter",
    name: "Landlord — 1 Property",
    category: "Landlord",
    price: 149,
    annualPrice: 1430,
    billingInterval: "month",
    period: "month",
    unitLimit: 1,
    propertiesLimit: "1 Property",
    isPopular: true,
    isActive: true,
    badge: "INTRODUCTORY PRICE",
    description: "Essential listing management for individual landlords.",
    features: [
      "Manage one property",
      "Create property listing",
      "Upload property photos",
      "Update property information",
      "Update availability",
      "Receive renter inquiries",
      "Manage property through web application",
    ],
    featureFlags: {
      instantChat: true,
      verifiedBadge: true,
      topRankSearch: false,
      viewingScheduler: false,
      maxPhotosPerListing: 6,
      leadAnalytics: false,
      leaseTemplates: false,
      multiStaffAccess: false,
    },
  },
  {
    id: "plan-1787131068912",
    name: "Landlord Portfolio",
    category: "Landlord",
    price: 1499,
    annualPrice: 14390,
    billingInterval: "month",
    period: "month",
    unitLimit: 6,
    propertiesLimit: "6 Properties",
    isPopular: false,
    isActive: true,
    badge: "Multi-Property",
    description: "Ideal for landlords and property managers managing multiple units.",
    features: [
      "Up to 6 Verified Property Listings",
      "Direct Tenant In-App Chat",
      "Priority Search Placement",
      "Viewing Appointment Scheduler",
      "Automated Monthly Analytics",
      "Priority 24/7 Mob'in Support",
    ],
    featureFlags: {
      instantChat: true,
      verifiedBadge: true,
      topRankSearch: true,
      viewingScheduler: true,
      maxPhotosPerListing: 15,
      leadAnalytics: true,
      leaseTemplates: true,
      multiStaffAccess: false,
    },
  },
];

// Helper to get local cache
function getLocalCache(key, fallback = []) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to save local cache
function setLocalCache(key, val) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Cache save error for ${key}:`, err);
  }
}

/**
 * 1. FETCH ALL ACTIVE SUBSCRIPTION PLANS (GET /api/v1/plans)
 */
export async function getSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price", { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped = data.map((d) => {
        const propertiesLimit = d.properties_limit || d.propertiesLimit || (d.unit_limit ? `${d.unit_limit} Properties` : "1 Property");
        const unitLimit = parseUnitLimit(propertiesLimit || d.unit_limit, 1);
        const price = Number(d.price);
        const annualPrice = Number(d.annual_price || Math.round(price * 12 * 0.8));

        return {
          id: d.id,
          name: d.name,
          category: d.category || "Landlord",
          price,
          annualPrice,
          billingInterval: d.billing_interval || d.period || "month",
          period: d.period || "month",
          unitLimit,
          propertiesLimit,
          isPopular: !!d.is_popular || !!d.isPopular,
          isActive: d.is_active ?? d.isActive ?? true,
          badge: d.badge || "",
          description: d.description || "",
          features: Array.isArray(d.features) ? d.features : JSON.parse(d.features || "[]"),
          featureFlags: typeof d.feature_flags === "object" && d.feature_flags !== null ? d.feature_flags : {},
        };
      });
      setLocalCache(LOCAL_STORAGE_KEYS.PLANS, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase fetch plans notice:", err);
  }

  // Fallback to local storage or defaults
  const cached = getLocalCache(LOCAL_STORAGE_KEYS.PLANS, null);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached.map((p) => ({
      ...p,
      unitLimit: parseUnitLimit(p.propertiesLimit || p.unitLimit, 1),
      propertiesLimit: p.propertiesLimit || `${p.unitLimit || 1} Property`,
    }));
  }
  return DEFAULT_PLANS;
}

/**
 * 2. ADMIN CONFIGURE/EDIT PLAN (POST /api/v1/admin/plans)
 */
export async function saveSubscriptionPlan(adminUser, planData) {
  if (!planData || !planData.id) throw new Error("Invalid plan configuration payload.");

  const propertiesLimit = planData.propertiesLimit || `${planData.unitLimit || 1} Property`;
  const unitLimit = parseUnitLimit(propertiesLimit, 1);
  const price = Number(planData.price);
  const annualPrice = Number(planData.annualPrice || Math.round(price * 12 * 0.8));

  const payload = {
    id: planData.id,
    name: planData.name,
    category: planData.category || "Landlord",
    price: price,
    period: planData.period || planData.billingInterval || "month",
    properties_limit: propertiesLimit,
    is_popular: !!planData.isPopular,
    is_active: planData.isActive ?? true,
    badge: planData.badge || "",
    description: planData.description || "",
    features: planData.features || [],
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .upsert([payload])
      .select()
      .single();

    if (error) console.warn("Supabase upsert plan warning:", error);
  } catch (err) {
    console.warn("DB Plan save notice:", err);
  }

  // Sync cache
  const currentPlans = await getSubscriptionPlans();
  const updatedPlans = currentPlans.some((p) => p.id === planData.id)
    ? currentPlans.map((p) => (p.id === planData.id ? { ...p, ...payload, unitLimit, propertiesLimit } : p))
    : [...currentPlans, { ...payload, unitLimit, propertiesLimit }];
  setLocalCache(LOCAL_STORAGE_KEYS.PLANS, updatedPlans);

  // Broadcast to other components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: updatedPlans }));
  }

  // Record audit log
  await recordAuditLog({
    adminId: adminUser?.id || "admin-001",
    adminEmail: adminUser?.email || "admin@mobin.ph",
    actionType: "plan_configured",
    targetLandlordId: "SYSTEM",
    targetLandlordEmail: "SYSTEM_CONFIG",
    previousStatus: "Active",
    newStatus: "Active",
    reason: `Configured plan tier '${planData.name}' (Price: ₱${planData.price}, Quota: ${propertiesLimit})`,
  });

  return { ...planData, ...payload, unitLimit, propertiesLimit };
}

/**
 * 2b. DELETE A SUBSCRIPTION TIER (DELETE /api/v1/plans/:id)
 */
export async function deleteSubscriptionPlan(adminUser, planId) {
  try {
    const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
    if (error) {
      console.warn("Supabase plan delete notice:", error);
    }
  } catch (err) {
    console.warn("deleteSubscriptionPlan error:", err);
  }

  // Update local cache
  const cached = getLocalCache(LOCAL_STORAGE_KEYS.PLANS, []);
  const updated = cached.filter((p) => p.id !== planId);
  setLocalCache(LOCAL_STORAGE_KEYS.PLANS, updated);

  // Broadcast to all active listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mobin_subscription_plans_updated", { detail: updated }));
  }

  // Record Audit Log
  await recordAuditLog({
    actor_id: adminUser?.id || "super-admin",
    actor_email: adminUser?.email || "admin@mobin.ph",
    action: "PLAN_DELETED",
    target_type: "PLAN",
    target_id: planId,
    details: { planId },
  });

  return updated;
}

/**
 * 3. GET LANDLORD'S CURRENT SUBSCRIPTION (GET /api/v1/subscriptions/my-plan)
 */
export async function getLandlordSubscription(landlordId, landlordEmail) {
  if (!landlordId && !landlordEmail) {
    return null;
  }
  const cleanId = String(landlordId || "");
  const cleanEmail = String(landlordEmail || "").toLowerCase().trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

  const plans = await getSubscriptionPlans();
  const landlordPlans = plans.filter(
    (p) => (p.category || "Landlord").toLowerCase() === "landlord"
  );
  const basePlan = landlordPlans[0] || plans[0] || DEFAULT_PLANS[0];

  const isDemoLandlord = cleanEmail === "landlord@mobin.ph" || cleanId === "landlord-001";
  if (isDemoLandlord) {
    const starterPlan = landlordPlans.find((p) => p.isPopular) || landlordPlans[0] || basePlan;
    return {
      id: "sub-demo-landlord",
      landlordId: cleanId || "landlord-001",
      landlordEmail: cleanEmail || "landlord@mobin.ph",
      landlordName: (typeof window !== "undefined" ? localStorage.getItem("mobin_landlord_custom_name") : null) || "Sarah Jenkins",
      planId: starterPlan.id,
      status: "Active",
      paymentChannel: "gcash",
      paymentGatewayRef: "PM-GCASH-DEMO",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      plan: starterPlan,
    };
  }

  try {
    let query = supabase.from("landlord_subscriptions").select("*, subscription_plans(*)");
    if (isUuid && cleanEmail) {
      query = query.or(`landlord_id.eq.${cleanId},landlord_email.eq.${cleanEmail}`);
    } else if (isUuid) {
      query = query.eq("landlord_id", cleanId);
    } else if (cleanEmail) {
      query = query.eq("landlord_email", cleanEmail);
    } else {
      return null;
    }
    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const activePlan = plans.find((p) => p.id === data.plan_id) || (data.subscription_plans
        ? {
            id: data.subscription_plans.id,
            name: data.subscription_plans.name,
            price: Number(data.subscription_plans.price),
            unitLimit: parseUnitLimit(data.subscription_plans.properties_limit || data.subscription_plans.unit_limit, 1),
            propertiesLimit: data.subscription_plans.properties_limit || "1 Property",
            features: Array.isArray(data.subscription_plans.features)
              ? data.subscription_plans.features
              : [],
          }
        : basePlan);

      return {
        id: data.id,
        landlordId: data.landlord_id,
        landlordEmail: data.landlord_email,
        landlordName: data.landlord_name,
        planId: data.plan_id,
        status: data.status,
        paymentChannel: data.payment_channel,
        paymentGatewayRef: data.payment_gateway_ref,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        autoRenew: data.auto_renew,
        plan: activePlan,
      };
    }
  } catch (err) {
    console.warn("Supabase fetch sub notice:", err);
  }

  // Fallback to local storage
  const allSubs = getLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, []);
  const match = allSubs.find(
    (s) =>
      (cleanId && s.landlordId === cleanId) ||
      (cleanEmail && String(s.landlordEmail || "").toLowerCase().trim() === cleanEmail)
  );

  if (match) {
    // Re-resolve against latest admin plans so live price/quota updates propagate immediately
    const matchedPlan = plans.find((p) => p.id === match.planId) || basePlan;
    return { ...match, plan: matchedPlan };
  }

  // Not subscribed yet
  return null;
}

/**
 * 4. INITIATE LANDLORD CHECKOUT (POST /api/v1/subscriptions/checkout)
 */
export async function initiateCheckoutSession(payload) {
  const {
    landlordId,
    landlordEmail,
    landlordName,
    planId,
    billingInterval = "monthly",
    paymentChannel = "gcash",
    tin = "123-456-789-000",
    proofImage = null,
    proofFileName = "",
    referenceNumber = "",
  } = payload;

  const plans = await getSubscriptionPlans();
  const selectedPlan = plans.find((p) => p.id === planId) || plans[0] || DEFAULT_PLANS[0];
  const finalPrice =
    billingInterval === "annual" ? selectedPlan.annualPrice || Math.round(selectedPlan.price * 12 * 0.8) : selectedPlan.price;

  const checkoutRef = referenceNumber || `REF-${paymentChannel.toUpperCase()}-${Date.now()}`;
  const now = new Date();
  const periodEnd = new Date(
    now.getTime() + (billingInterval === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000
  );

  const subRecord = {
    id: `sub-${Date.now()}`,
    landlordId: landlordId || "landlord-001",
    landlordEmail: landlordEmail || "landlord@mobin.ph",
    landlordName: landlordName || "Juan Dela Cruz",
    planId: selectedPlan.id,
    status: "Active",
    paymentChannel: paymentChannel,
    paymentGatewayRef: checkoutRef,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    autoRenew: true,
    tin: tin,
    plan: selectedPlan,
  };

  // Generate official receipt invoice
  const orNumber = `OR-${Math.floor(100000 + Math.random() * 900000)}`;
  const invoiceRecord = {
    id: `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    subscriptionId: subRecord.id,
    landlordId: subRecord.landlordId,
    orNumber: orNumber,
    reference: referenceNumber || checkoutRef,
    date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    plan: `${selectedPlan.name} (${billingInterval === "annual" ? "Annual" : "Monthly"})`,
    amount: `₱${finalPrice}.00`,
    subtotal: `₱${finalPrice}.00`,
    vat: "₱0.00",
    status: "Paid",
    channel: paymentChannel.toUpperCase(),
    paidAt: now.toISOString(),
    planName: selectedPlan.name,
    proof_image: proofImage || null,
    proof_filename: proofFileName || "",
    user_email: landlordEmail || "landlord@mobin.ph",
  };

  // Persist in DB & Cache
  try {
    await supabase.from("landlord_subscriptions").upsert([
      {
        landlord_id: subRecord.landlordId,
        landlord_email: subRecord.landlordEmail,
        landlord_name: subRecord.landlordName,
        plan_id: subRecord.planId,
        status: "Active",
        payment_channel: paymentChannel,
        payment_gateway_ref: checkoutRef,
        current_period_start: subRecord.currentPeriodStart,
        current_period_end: subRecord.currentPeriodEnd,
        auto_renew: true,
      },
    ]);
  } catch (_) {}

  const allSubs = getLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, []);
  const cleanSubId = String(subRecord.landlordId);
  const cleanSubEmail = String(subRecord.landlordEmail).toLowerCase().trim();
  const filtered = allSubs.filter(
    (s) => s.landlordId !== cleanSubId && String(s.landlordEmail || "").toLowerCase().trim() !== cleanSubEmail
  );
  setLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, [subRecord, ...filtered]);

  const allInvoices = getLocalCache(LOCAL_STORAGE_KEYS.INVOICES, []);
  setLocalCache(LOCAL_STORAGE_KEYS.INVOICES, [invoiceRecord, ...allInvoices]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mobin_subscription_updated", { detail: subRecord }));
  }

  return {
    success: true,
    subscription: subRecord,
    invoice: invoiceRecord,
    gatewayReference: checkoutRef,
  };
}

/**
 * 5. WEBHOOK HANDLER (POST /api/v1/subscriptions/webhooks)
 * Success -> 'Active'
 * Failure -> 3-day 'Grace_Period'
 */
export async function handlePaymentWebhook(event) {
  const { eventType, landlordId, paymentGatewayRef, failureReason } = event;

  const allSubs = getLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, []);
  const sub = allSubs.find((s) => s.landlordId === landlordId || s.paymentGatewayRef === paymentGatewayRef);

  if (!sub) return { received: true, message: "Subscription not found for webhook" };

  if (eventType === "payment.success" || eventType === "checkout.session.completed") {
    sub.status = "Active";
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (eventType === "payment.failed" || eventType === "charge.failed") {
    // Set 3-Day Grace Period
    sub.status = "Grace_Period";
    sub.currentPeriodEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    sub.failureReason = failureReason || "Insufficient balance on local E-Wallet/Card";
  } else if (eventType === "subscription.cancelled") {
    sub.status = "Cancelled";
    sub.autoRenew = false;
  }

  setLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, allSubs);

  // Sync to DB
  try {
    await supabase
      .from("landlord_subscriptions")
      .update({
        status: sub.status,
        current_period_end: sub.currentPeriodEnd,
        auto_renew: sub.autoRenew,
      })
      .eq("landlord_id", sub.landlordId);
  } catch (_) {}

  return { received: true, status: sub.status, landlordId: sub.landlordId };
}

/**
 * 6. ADMIN SUBSCRIPTION OVERRIDE (POST /api/v1/admin/subscriptions/override)
 * Compulsory Audit Log Write
 */
export async function adminOverrideSubscription(adminUser, overridePayload) {
  const { landlordId, landlordEmail, newStatus, extendedUntil, reason } = overridePayload;

  if (!reason || reason.trim().length < 5) {
    throw new Error("Compulsory Audit Error: A clear reason (min. 5 chars) is mandatory for audit logging.");
  }

  const allSubs = getLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, []);
  const targetSub = allSubs.find((s) => s.landlordId === landlordId || s.landlordEmail === landlordEmail);
  const previousStatus = targetSub?.status || "Active";

  if (targetSub) {
    targetSub.status = newStatus;
    if (extendedUntil) targetSub.currentPeriodEnd = extendedUntil;
    setLocalCache(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, allSubs);
  }

  // Update DB
  try {
    await supabase
      .from("landlord_subscriptions")
      .update({
        status: newStatus,
        current_period_end: extendedUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .or(`landlord_id.eq.${landlordId},landlord_email.eq.${landlordEmail}`);
  } catch (_) {}

  // Write Compulsory Audit Log Entry
  const auditLog = await recordAuditLog({
    adminId: adminUser?.id || "super-admin-001",
    adminEmail: adminUser?.email || "admin@mobin.ph",
    actionType: "status_override",
    targetLandlordId: landlordId,
    targetLandlordEmail: landlordEmail,
    previousStatus: previousStatus,
    newStatus: newStatus,
    reason: reason.trim(),
  });

  return { success: true, newStatus, auditLog };
}

/**
 * 7. AUDIT LOG WRITER HELPER
 */
export async function recordAuditLog(logPayload) {
  const logEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminId: logPayload.adminId,
    adminEmail: logPayload.adminEmail,
    actionType: logPayload.actionType || "status_override",
    targetLandlordId: logPayload.targetLandlordId,
    targetLandlordEmail: logPayload.targetLandlordEmail,
    previousStatus: logPayload.previousStatus,
    newStatus: logPayload.newStatus,
    reason: logPayload.reason,
    timestamp: new Date().toISOString(),
  };

  try {
    await supabase.from("subscription_audit_logs").insert([
      {
        admin_id: logEntry.adminId,
        admin_email: logEntry.adminEmail,
        action_type: logEntry.actionType,
        target_landlord_id: logEntry.targetLandlordId,
        target_landlord_email: logEntry.targetLandlordEmail,
        previous_status: logEntry.previousStatus,
        new_status: logEntry.newStatus,
        reason: logEntry.reason,
      },
    ]);
  } catch (_) {}

  const currentLogs = getLocalCache(LOCAL_STORAGE_KEYS.AUDIT_LOGS, []);
  setLocalCache(LOCAL_STORAGE_KEYS.AUDIT_LOGS, [logEntry, ...currentLogs]);
  return logEntry;
}

/**
 * 8. GET AUDIT LOGS (GET /api/v1/admin/audit-logs)
 */
export async function getSubscriptionAuditLogs() {
  try {
    const { data, error } = await supabase
      .from("subscription_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        adminId: d.admin_id,
        adminEmail: d.admin_email,
        actionType: d.action_type,
        targetLandlordId: d.target_landlord_id,
        targetLandlordEmail: d.target_landlord_email,
        previousStatus: d.previous_status,
        newStatus: d.new_status,
        reason: d.reason,
        timestamp: d.created_at,
      }));
    }
  } catch (_) {}

  return getLocalCache(LOCAL_STORAGE_KEYS.AUDIT_LOGS, [
    {
      id: "audit-seed-1",
      adminId: "admin-001",
      adminEmail: "admin@mobin.ph",
      actionType: "status_override",
      targetLandlordId: "landlord-001",
      targetLandlordEmail: "sarah.jenkins@dorms.ph",
      previousStatus: "Grace_Period",
      newStatus: "Active",
      reason: "Landlord confirmed offline GCash reference OR-99281. Extended 30 days.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "audit-seed-2",
      adminId: "admin-001",
      adminEmail: "admin@mobin.ph",
      actionType: "plan_configured",
      targetLandlordId: "SYSTEM",
      targetLandlordEmail: "SYSTEM_CONFIG",
      previousStatus: "Active",
      newStatus: "Active",
      reason: "Adjusted Landlord Portfolio limit to 5 properties with featured search boost.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
}

/**
 * 9. ACCESS CONTROL & FEATURE ENFORCEMENT MIDDLEWARE
 * Checks if Landlord's active listings exceed their plan's Unit Limit
 */
export async function enforceSubscriptionLimit(landlordId, landlordEmail, currentPropertyCount = 0) {
  const sub = await getLandlordSubscription(landlordId, landlordEmail);

  if (!sub) {
    return {
      allowed: false,
      reason: "You do not have an active subscription. Please subscribe to a landlord plan first to publish properties.",
      unitLimit: 0,
      currentCount: currentPropertyCount,
      planName: "No Active Plan",
      needSubscribe: true,
      canUpgrade: true,
    };
  }

  const unitLimit = parseUnitLimit(sub.plan?.propertiesLimit || sub.plan?.unitLimit, 1);
  const isStatusValid = sub.status === "Active" || sub.status === "Free_Trial" || sub.status === "Comped_Partner";

  if (!isStatusValid) {
    return {
      allowed: false,
      reason: `Subscription is currently in '${sub.status}' state. Please renew or settle balance to add listings.`,
      unitLimit,
      currentCount: currentPropertyCount,
      planName: sub.plan?.name || "Landlord Plan",
    };
  }

  if (unitLimit < 999 && currentPropertyCount >= unitLimit) {
    return {
      allowed: false,
      reason: `You have reached the maximum listing limit (${unitLimit} ${unitLimit === 1 ? "unit" : "units"}) for your ${sub.plan?.name || "Active Plan"}. Please upgrade your subscription to add more properties.`,
      unitLimit,
      currentCount: currentPropertyCount,
      planName: sub.plan?.name || "Landlord Plan",
      canUpgrade: true,
    };
  }

  return {
    allowed: true,
    remainingSlots: unitLimit >= 999 ? 999 : Math.max(0, unitLimit - currentPropertyCount),
    unitLimit,
    currentCount: currentPropertyCount,
    planName: sub.plan?.name || "Landlord Plan",
  };
}
