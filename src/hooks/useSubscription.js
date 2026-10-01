import { useState, useEffect, useCallback } from "react";
import {
  getSubscriptionPlans,
  getLandlordSubscription,
  initiateCheckoutSession,
  enforceSubscriptionLimit,
  parseUnitLimit,
  DEFAULT_PLANS,
} from "../services/subscriptionService";
import { supabase } from "../supabaseClient";
import { filterPropertiesForUser } from "../lib/utils";

/**
 * Custom React Hook for Landlord & App Subscription Management
 */
export function useSubscription(user) {
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem("mobin_subscription_plans");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PLANS;
  });
  const [subscription, setSubscription] = useState(() => {
    try {
      const allSubs = JSON.parse(localStorage.getItem("mobin_landlord_subscriptions") || "[]");
      const cleanId = String(user?.id || "");
      const cleanEmail = String(user?.email || "").toLowerCase().trim();
      const match = allSubs.find(
        (s) =>
          (cleanId && s.landlordId === cleanId) ||
          (cleanEmail && String(s.landlordEmail || "").toLowerCase().trim() === cleanEmail)
      );
      return match || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyCount, setPropertyCount] = useState(() => {
    try {
      const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
      return filterPropertiesForUser(cachedProps, user).length;
    } catch {
      return 0;
    }
  });

  // Fetch subscription & plans
  const fetchSubscriptionData = useCallback(async () => {
    setError(null);
    try {
      const [fetchedPlans, landlordSub] = await Promise.all([
        getSubscriptionPlans(),
        getLandlordSubscription(user?.id, user?.email),
      ]);

      if (fetchedPlans && fetchedPlans.length > 0) setPlans(fetchedPlans);
      if (landlordSub) setSubscription(landlordSub);

      // Query actual properties from Supabase
      try {
        let query = supabase.from("properties").select("id", { count: "exact" });
        const isUuid = typeof user?.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        if (isUuid && user?.email) {
          query = query.or(`landlord_id.eq.${user.id},landlord_email.eq.${user.email}`);
        } else if (isUuid) {
          query = query.eq("landlord_id", user.id);
        } else if (user?.email) {
          query = query.eq("landlord_email", user.email);
        }
        const { count, error: propErr } = await query;
        if (!propErr && count !== null && count !== undefined) {
          setPropertyCount(count);
        } else {
          const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
          setPropertyCount(filterPropertiesForUser(cachedProps, user).length);
        }
      } catch {
        const cachedProps = JSON.parse(localStorage.getItem("mobin_properties") || "[]");
        setPropertyCount(filterPropertiesForUser(cachedProps, user).length);
      }
    } catch (err) {
      console.warn("useSubscription background sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchSubscriptionData();

    // Listen to admin plan updates and subscription updates
    const handleUpdate = () => {
      fetchSubscriptionData();
    };

    window.addEventListener("mobin_subscription_plans_updated", handleUpdate);
    window.addEventListener("mobin_subscription_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("mobin_subscription_plans_updated", handleUpdate);
      window.removeEventListener("mobin_subscription_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchSubscriptionData]);

  // Derived state
  const isSubscribed =
    !!subscription &&
    ["active", "free_trial", "comped_partner"].includes((subscription.status || "").toLowerCase());
  const currentPlan = subscription?.plan || null;
  const unitLimit = currentPlan ? parseUnitLimit(currentPlan.propertiesLimit || currentPlan.unitLimit, 1) : 0;
  const isQuotaReached = !isSubscribed || (unitLimit < 999 && propertyCount >= unitLimit);
  const remainingSlots = unitLimit >= 999 ? 999 : Math.max(0, unitLimit - propertyCount);
  const usagePercentage =
    unitLimit > 0
      ? unitLimit >= 999
        ? Math.min(100, Math.round((propertyCount / 20) * 100))
        : Math.min(100, Math.round((propertyCount / unitLimit) * 100))
      : 100;

  const landlordPlans = (plans || []).filter(
    (p) => (p.category || "Landlord").toLowerCase() === "landlord"
  );

  // Feature flag checker
  const hasFeature = useCallback(
    (featureName) => {
      if (!currentPlan?.featureFlags) return false;
      return !!currentPlan.featureFlags[featureName];
    },
    [currentPlan]
  );

  // Check if landlord can add a new property
  const checkCanAddProperty = useCallback(async () => {
    return await enforceSubscriptionLimit(user?.id, user?.email, propertyCount);
  }, [user?.id, user?.email, propertyCount]);

  // Trigger checkout / upgrade
  const triggerCheckout = useCallback(
    async ({ planId, billingInterval = "monthly", paymentChannel = "gcash", tin, proofImage, proofFileName, referenceNumber }) => {
      setLoading(true);
      try {
        const res = await initiateCheckoutSession({
          landlordId: user?.id || (user?.email === "landlord@mobin.ph" ? "landlord-001" : `landlord-${Date.now()}`),
          landlordEmail: user?.email || (user?.id === "landlord-001" ? "landlord@mobin.ph" : ""),
          landlordName: user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split("@")[0] : "Landlord"),
          planId,
          billingInterval,
          paymentChannel,
          tin,
          proofImage,
          proofFileName,
          referenceNumber,
        });

        if (res.success) {
          setSubscription(res.subscription);
          return { success: true, data: res };
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // 1-Click upgrade shortcut
  const upgradePlan = useCallback(
    async (newPlanId, options = {}) => {
      return await triggerCheckout({
        planId: newPlanId,
        paymentChannel: options.paymentChannel || subscription?.paymentChannel || "gcash",
        billingInterval: options.billingInterval || "monthly",
        tin: options.tin,
        proofImage: options.proofImage,
        proofFileName: options.proofFileName,
        referenceNumber: options.referenceNumber,
      });
    },
    [triggerCheckout, subscription]
  );

  return {
    plans,
    landlordPlans,
    subscription,
    currentPlan,
    isSubscribed,
    loading,
    error,
    propertyCount,
    unitLimit,
    remainingSlots,
    usagePercentage,
    isQuotaReached,
    hasFeature,
    checkCanAddProperty,
    triggerCheckout,
    upgradePlan,
    refetch: fetchSubscriptionData,
  };
}
