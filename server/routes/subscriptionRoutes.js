// =====================================================================
// MOB'IN PLATFORM: SUBSCRIPTION API ROUTES
// Connects Landlord, Super Admin, and Webhook Endpoints
// =====================================================================

import { Router } from "express";
import {
  getPlans,
  getMySubscription,
  createCheckoutSession,
  cancelSubscription,
  adminUpsertPlan,
  adminOverrideSubscription,
  getSubscriptionAnalytics,
  getAuditLogs,
} from "../controllers/subscriptionController.js";
import { handlePaymentWebhook } from "../controllers/webhookController.js";
import { enforceUnitLimit } from "../middleware/enforceUnitLimit.js";

const router = Router();

// ==========================================
// 1. PUBLIC & LANDLORD SUBSCRIPTION ROUTES
// ==========================================
// GET /api/v1/subscriptions/plans - List active pricing tiers
router.get("/subscriptions/plans", getPlans);

// GET /api/v1/subscriptions/me - Fetch current landlord subscription & usage metrics
router.get("/subscriptions/me", getMySubscription);

// POST /api/v1/subscriptions/checkout-session - Initiate payment checkout
router.post("/subscriptions/checkout-session", createCheckoutSession);

// POST /api/v1/subscriptions/cancel - Disable recurring auto-billing
router.post("/subscriptions/cancel", cancelSubscription);

// ==========================================
// 2. PAYMENT GATEWAY WEBHOOKS
// ==========================================
// POST /api/v1/webhooks/payment - Webhook state transitions (succeeded, failed, cancelled)
router.post("/webhooks/payment", handlePaymentWebhook);

// ==========================================
// 3. SUPER ADMIN CONTROLS & ANALYTICS
// ==========================================
// POST /api/v1/admin/plans - Configure/create pricing tiers
router.post("/admin/plans", adminUpsertPlan);

// POST /api/v1/admin/subscriptions/override - Issue manual overrides with mandatory reason
router.post("/admin/subscriptions/override", adminOverrideSubscription);

// GET /api/v1/admin/analytics/subscriptions - MRR, ARR, and subscriber breakdown
router.get("/admin/analytics/subscriptions", getSubscriptionAnalytics);

// GET /api/v1/admin/audit-logs - Immutable compliance audit trail
router.get("/admin/audit-logs", getAuditLogs);

export default router;
