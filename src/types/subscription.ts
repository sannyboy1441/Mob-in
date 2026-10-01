// =====================================================================
// MOB'IN PLATFORM: SHARED TYPESCRIPT / API RESPONSE CONTRACTS
// =====================================================================

export type BillingInterval = 'monthly' | 'annual';

export type SubscriptionStatus =
  | 'active'
  | 'grace_period'
  | 'cancelled'
  | 'expired'
  | 'free_trial'
  | 'comped_partner';

export type PaymentChannel = 'gcash' | 'maya' | 'card' | 'qrph';

export type AuditActionType =
  | 'status_override'
  | 'grace_extension'
  | 'manual_comp'
  | 'tier_upgrade'
  | 'tier_downgrade'
  | 'plan_configured'
  | 'webhook_transition';

export interface FeatureFlags {
  instantChat: boolean;
  verifiedBadge: boolean;
  topRankSearch: boolean;
  viewingScheduler: boolean;
  maxPhotosPerListing: number;
  leadAnalytics: boolean;
  leaseTemplates: boolean;
  multiStaffAccess: boolean;
}

export interface Plan {
  id: string;
  name: string;
  category: 'Landlord' | 'Renter';
  price: number;
  annual_price: number;
  billing_interval: BillingInterval;
  unit_limit: number;
  is_popular?: boolean;
  is_active: boolean;
  badge?: string;
  description: string;
  features: string[];
  feature_flags: FeatureFlags;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  landlord_id: string;
  landlord_email: string;
  landlord_name?: string;
  plan_id: string;
  status: SubscriptionStatus;
  payment_channel: PaymentChannel;
  gateway_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  grace_period_deadline?: string | null;
  auto_renew: boolean;
  created_at?: string;
  updated_at?: string;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  landlord_id: string;
  or_number: string;
  amount: number;
  vat_amount: number;
  status: 'paid' | 'failed' | 'pending';
  payment_channel: PaymentChannel;
  paid_at: string;
  pdf_url?: string;
}

export interface SubscriptionAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: AuditActionType;
  target_landlord_id: string;
  target_landlord_email: string;
  previous_status: SubscriptionStatus;
  new_status: SubscriptionStatus;
  reason: string;
  created_at: string;
}

// API REQUEST & RESPONSE INTERFACES
export interface CheckoutSessionRequest {
  landlord_id: string;
  landlord_email: string;
  landlord_name?: string;
  plan_id: string;
  billing_interval?: BillingInterval;
  payment_channel: PaymentChannel;
  tin?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  checkout_session_id: string;
  checkout_url?: string;
  subscription: Subscription;
  invoice: Invoice;
}

export interface StatusOverrideRequest {
  landlord_id: string;
  landlord_email: string;
  new_status: SubscriptionStatus;
  extended_until?: string;
  reason: string; // COMPULSORY
}

export interface StatusOverrideResponse {
  success: boolean;
  previous_status: SubscriptionStatus;
  new_status: SubscriptionStatus;
  audit_log: SubscriptionAuditLog;
}

export interface SubscriptionAnalyticsResponse {
  mrr: number;
  arr: number;
  active_subscribers_count: number;
  grace_period_count: number;
  expired_count: number;
  churn_rate_percentage: number;
  revenue_by_channel: Record<PaymentChannel, number>;
}

export interface EnforceLimitResult {
  allowed: boolean;
  reason?: string;
  unit_limit: number;
  active_properties_count: number;
  remaining_slots: number;
  plan_name: string;
  can_upgrade?: boolean;
}
