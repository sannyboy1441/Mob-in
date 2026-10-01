-- =====================================================================
-- MOB'IN PLATFORM: FINANCIALS & PAYMENT LEDGER SCHEMA
-- Author: Principal Full-Stack Engineer
-- Date: 2026-09-17
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUBSCRIPTION INVOICES & PAYMENTS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id VARCHAR(64) PRIMARY KEY,
  subscription_id UUID,
  landlord_id VARCHAR(128),
  payer_name VARCHAR(255) NOT NULL DEFAULT 'Mobin Customer',
  payer_email VARCHAR(255) NOT NULL,
  role VARCHAR(64) NOT NULL DEFAULT 'Landlord', -- 'Landlord' | 'Student / Renter'
  item VARCHAR(255) NOT NULL DEFAULT 'Landlord Subscription',
  or_number VARCHAR(64) NOT NULL, -- BIR / Official Receipt reference
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) NOT NULL DEFAULT 'Completed', -- 'Completed' | 'Pending' | 'Refunded' | 'Failed'
  gateway VARCHAR(64) NOT NULL DEFAULT 'GCash (PayMongo)',
  payment_channel VARCHAR(32) NOT NULL DEFAULT 'gcash', -- 'gcash' | 'maya' | 'card' | 'qrph'
  ref_no VARCHAR(128) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY & OPEN POLICIES
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_invoices' AND policyname = 'Allow public read access to invoices'
  ) THEN
    CREATE POLICY "Allow public read access to invoices" 
    ON public.subscription_invoices 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_invoices' AND policyname = 'Allow public insert access to invoices'
  ) THEN
    CREATE POLICY "Allow public insert access to invoices" 
    ON public.subscription_invoices 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_invoices' AND policyname = 'Allow public update access to invoices'
  ) THEN
    CREATE POLICY "Allow public update access to invoices" 
    ON public.subscription_invoices 
    FOR UPDATE 
    USING (true);
  END IF;
END $$;

-- 4. CREATE INDEXES FOR FAST FILTERING AND REPORTING
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON public.subscription_invoices(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.subscription_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_channel ON public.subscription_invoices(payment_channel);
CREATE INDEX IF NOT EXISTS idx_invoices_payer_email ON public.subscription_invoices(payer_email);

-- 5. SEED INITIAL VERIFIED PHILIPPINE PAYMENTS IF TABLE IS EMPTY
INSERT INTO public.subscription_invoices (id, payer_name, payer_email, role, item, or_number, amount, vat_amount, status, gateway, payment_channel, ref_no, paid_at, created_at)
SELECT * FROM (VALUES
  ('INV-2026-0089', 'Sarah Jenkins', 'sarah.jenkins@dorms.ph', 'Landlord', 'Landlord Portfolio Plan (Monthly)', 'OR-2026-0089', 599.00, 0.00, 'Completed', 'GCash (PayMongo)', 'gcash', 'PM-GCASH-991823', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('INV-2026-0088', 'Engr. Manuel Torres', 'manuel.torres@manilarealty.ph', 'Landlord', 'Dorm & Complex Operator Plan', 'OR-2026-0088', 1299.00, 0.00, 'Completed', 'Maya (PayMongo)', 'maya', 'PM-MAYA-441829', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  ('INV-2026-0087', 'Joshua Garcia', 'joshua.student@up.edu.ph', 'Student / Renter', 'Student 1-Month Direct Booking Pass', 'OR-2026-0087', 99.00, 0.00, 'Completed', 'GCash (PayMongo)', 'gcash', 'PM-GCASH-112094', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('INV-2026-0086', 'Atty. Cristina Tan', 'cristina.tan@quezonproperties.ph', 'Landlord', 'Landlord Starter Plan (Monthly)', 'OR-2026-0086', 299.00, 0.00, 'Completed', 'Visa / Mastercard', 'card', 'PM-CARD-883012', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('INV-2026-0085', 'Kimberly Rivera', 'kim.rivera@ust.edu.ph', 'Student / Renter', 'Student 1-Month Direct Booking Pass', 'OR-2026-0085', 99.00, 0.00, 'Completed', 'Maya (PayMongo)', 'maya', 'PM-MAYA-772910', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('INV-2026-0084', 'Roberto Santos', 'roberto.santos@cubaoapartments.ph', 'Landlord', 'Landlord Portfolio Plan (Monthly)', 'OR-2026-0084', 599.00, 0.00, 'Pending', 'GCash (PayMongo)', 'gcash', 'PM-GCASH-002918', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days')
) AS v(id, payer_name, payer_email, role, item, or_number, amount, vat_amount, status, gateway, payment_channel, ref_no, paid_at, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_invoices LIMIT 1);
