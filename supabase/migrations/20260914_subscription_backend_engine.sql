-- =====================================================================
-- MOB'IN PLATFORM: ADVANCED SUBSCRIPTIONS BACKEND & STATE ENGINE
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'Landlord',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  annual_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly' | 'annual'
  unit_limit INTEGER NOT NULL DEFAULT 1,
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

-- 3. SUBSCRIPTIONS TABLE WITH 3-DAY GRACE DEADLINE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id VARCHAR(128) NOT NULL,
  landlord_email VARCHAR(255) NOT NULL,
  landlord_name VARCHAR(255),
  plan_id VARCHAR(64) NOT NULL REFERENCES public.plans(id) ON UPDATE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'grace_period', 'cancelled', 'expired', 'free_trial', 'comped_partner')),
  payment_channel VARCHAR(32) NOT NULL DEFAULT 'gcash' CHECK (payment_channel IN ('gcash', 'maya', 'card', 'qrph')),
  gateway_subscription_id VARCHAR(128),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  grace_period_deadline TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_subscriptions_landlord UNIQUE (landlord_id)
);

-- 4. INVOICES & OFFICIAL RECEIPTS TABLE (BIR COMPLIANT)
CREATE TABLE IF NOT EXISTS public.invoices (
  id VARCHAR(64) PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  landlord_id VARCHAR(128) NOT NULL,
  or_number VARCHAR(64) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'failed', 'pending')),
  payment_channel VARCHAR(32) NOT NULL DEFAULT 'gcash',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBSCRIPTION AUDIT LOGS TABLE (COMPULSORY REASON LOGGING)
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id VARCHAR(128) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  target_landlord_id VARCHAR(128) NOT NULL,
  target_landlord_email VARCHAR(255) NOT NULL,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_subs_landlord ON public.subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_grace_deadline ON public.subscriptions(grace_period_deadline) WHERE status = 'grace_period';
CREATE INDEX IF NOT EXISTS idx_invoices_landlord ON public.invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.subscription_audit_logs(target_landlord_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.subscription_audit_logs(created_at DESC);

-- 7. ATOMIC STORED PROCEDURE: ADMIN OVERRIDE WITH AUDIT LOG TRANSACTION
CREATE OR REPLACE FUNCTION public.admin_override_subscription_tx(
  p_admin_id VARCHAR(128),
  p_admin_email VARCHAR(255),
  p_target_landlord_id VARCHAR(128),
  p_target_landlord_email VARCHAR(255),
  p_new_status VARCHAR(32),
  p_extended_until TIMESTAMP WITH TIME ZONE,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prev_status VARCHAR(32);
  v_sub_id UUID;
  v_audit_id UUID;
BEGIN
  -- Validate mandatory reason
  IF p_reason IS NULL OR char_length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'Audit Validation Failed: A descriptive reason (min. 5 chars) is mandatory.';
  END IF;

  -- Fetch current subscription
  SELECT id, status INTO v_sub_id, v_prev_status
  FROM public.subscriptions
  WHERE landlord_id = p_target_landlord_id OR landlord_email = p_target_landlord_email
  LIMIT 1;

  IF v_prev_status IS NULL THEN
    v_prev_status := 'active';
  END IF;

  -- Update Subscription
  UPDATE public.subscriptions
  SET
    status = p_new_status,
    current_period_end = COALESCE(p_extended_until, current_period_end),
    grace_period_deadline = CASE WHEN p_new_status = 'grace_period' THEN NOW() + INTERVAL '3 days' ELSE NULL END,
    updated_at = NOW()
  WHERE landlord_id = p_target_landlord_id OR landlord_email = p_target_landlord_email;

  -- Insert Compulsory Audit Log
  INSERT INTO public.subscription_audit_logs (
    admin_id,
    admin_email,
    action_type,
    target_landlord_id,
    target_landlord_email,
    previous_status,
    new_status,
    reason,
    created_at
  ) VALUES (
    p_admin_id,
    p_admin_email,
    'status_override',
    p_target_landlord_id,
    p_target_landlord_email,
    v_prev_status,
    p_new_status,
    trim(p_reason),
    NOW()
  ) RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'subscription_id', v_sub_id,
    'previous_status', v_prev_status,
    'new_status', p_new_status,
    'audit_log_id', v_audit_id
  );
END;
$$;

-- 8. SEED PRODUCTION TIERS
INSERT INTO public.plans (id, name, category, price, annual_price, billing_interval, unit_limit, is_popular, is_active, badge, description, features, feature_flags)
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
