-- =====================================================================
-- MOB'IN PLATFORM: LANDLORD & ADMIN SUBSCRIPTION MODULE MIGRATION
-- Author: Principal Full-Stack Engineer
-- Date: 2026-09-13
-- =====================================================================

-- 1. SUBSCRIPTION PLANS TABLE (D1)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'Landlord',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  annual_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly' | 'annual'
  unit_limit INTEGER NOT NULL DEFAULT 1, -- Cap on active property listings
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  badge VARCHAR(64),
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{
    "instantChat": true,
    "verifiedBadge": true,
    "topRankSearch": false,
    "viewingScheduler": false,
    "maxPhotosPerListing": 6,
    "leadAnalytics": false,
    "leaseTemplates": false,
    "multiStaffAccess": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LANDLORD SUBSCRIPTIONS TABLE (D2)
CREATE TABLE IF NOT EXISTS public.landlord_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id VARCHAR(128) NOT NULL,
  landlord_email VARCHAR(255) NOT NULL,
  landlord_name VARCHAR(255),
  plan_id VARCHAR(64) NOT NULL REFERENCES public.subscription_plans(id) ON UPDATE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active' | 'Grace_Period' | 'Cancelled' | 'Expired' | 'Free_Trial' | 'Comped_Partner'
  payment_channel VARCHAR(32) NOT NULL DEFAULT 'gcash', -- 'gcash' | 'maya' | 'card' | 'qrph'
  payment_gateway_ref VARCHAR(128),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_landlord_active_sub UNIQUE (landlord_id)
);

-- 3. SUBSCRIPTION INVOICES & OFFICIAL RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id VARCHAR(64) PRIMARY KEY,
  subscription_id UUID REFERENCES public.landlord_subscriptions(id) ON DELETE SET NULL,
  landlord_id VARCHAR(128) NOT NULL,
  or_number VARCHAR(64) NOT NULL, -- BIR Official Receipt reference
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'Paid', -- 'Paid' | 'Pending' | 'Failed'
  payment_channel VARCHAR(32) NOT NULL DEFAULT 'gcash',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invoice_url TEXT
);

-- 4. SUBSCRIPTION AUDIT LOGS TABLE (D3 - MANDATORY REASON RECORDING)
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(128) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  action_type VARCHAR(64) NOT NULL, -- 'status_override' | 'grace_extension' | 'manual_comp' | 'tier_upgrade' | 'plan_configured'
  target_landlord_id VARCHAR(128) NOT NULL,
  target_landlord_email VARCHAR(255) NOT NULL,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  reason TEXT NOT NULL, -- COMPULSORY RATIONALE FOR AUDIT
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR ULTRA-FAST LOOKUPS & ENFORCEMENT
CREATE INDEX IF NOT EXISTS idx_landlord_subs_landlord_id ON public.landlord_subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_status ON public.landlord_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.subscription_audit_logs(target_landlord_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.subscription_audit_logs(created_at DESC);

-- SEED PRODUCTION DEFAULT TIERS
INSERT INTO public.subscription_plans (id, name, category, price, annual_price, billing_interval, unit_limit, is_popular, is_active, badge, description, features, feature_flags)
VALUES
(
  'starter',
  'Landlord Starter',
  'Landlord',
  299.00,
  2870.00,
  'monthly',
  1,
  FALSE,
  TRUE,
  'Solo Landlords',
  'Best for solo landlords managing 1 unit, dormitory room, or boarding studio.',
  '["1 Verified Property Listing", "Direct In-App Tenant Messaging", "Verified Landlord Trust Badge", "Standard Search Algorithm Placement", "Photo Gallery (up to 6 photos)"]'::jsonb,
  '{"instantChat": true, "verifiedBadge": true, "topRankSearch": false, "viewingScheduler": false, "maxPhotosPerListing": 6, "leadAnalytics": false, "leaseTemplates": false, "multiStaffAccess": false}'::jsonb
),
(
  'portfolio',
  'Landlord Portfolio',
  'Landlord',
  599.00,
  5750.00,
  'monthly',
  5,
  TRUE,
  TRUE,
  'Most Popular',
  'For property managers and landlords managing multiple apartments or student dorms.',
  '["Up to 5 Verified Property Listings", "Priority Featured Search Placement (2x Views)", "Viewing Appointment Scheduler", "Photo Gallery (up to 15 photos per listing)", "Lead Analytics & Inquiry Reports", "Priority 24/7 Mob\'in Landlord Support"]'::jsonb,
  '{"instantChat": true, "verifiedBadge": true, "topRankSearch": true, "viewingScheduler": true, "maxPhotosPerListing": 15, "leadAnalytics": true, "leaseTemplates": true, "multiStaffAccess": false}'::jsonb
),
(
  'operator',
  'Dorm & Complex Operator',
  'Landlord',
  1299.00,
  12470.00,
  'monthly',
  25,
  FALSE,
  TRUE,
  'Commercial Operator',
  'Comprehensive management tools for large boarding complexes, dormitories, and multi-building operators.',
  '["Up to 25 Property / Bedspace Listings", "Top-Rank Search Algorithm Placement", "Multi-Staff Inquiry Manager", "Automated Lease Agreement Templates", "Bulk Room & Bedspace Inventory Manager", "Dedicated Account Specialist"]'::jsonb,
  '{"instantChat": true, "verifiedBadge": true, "topRankSearch": true, "viewingScheduler": true, "maxPhotosPerListing": 25, "leadAnalytics": true, "leaseTemplates": true, "multiStaffAccess": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  annual_price = EXCLUDED.annual_price,
  unit_limit = EXCLUDED.unit_limit,
  features = EXCLUDED.features,
  feature_flags = EXCLUDED.feature_flags;
