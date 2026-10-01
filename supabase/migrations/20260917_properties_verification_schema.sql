-- ==============================================================================
-- Migration: Add Verification & Landlord Details to Public Properties Table
-- Date: 2026-09-17
-- Description: Adds missing columns (status, verification, landlord info, photos, etc.)
--              and configures RLS policies to allow smooth Landlord submission and
--              Admin Verification workflows.
-- ==============================================================================

-- 1. Add all missing columns to public.properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS landlord_id uuid,
ADD COLUMN IF NOT EXISTS landlord_name text DEFAULT 'Landlord',
ADD COLUMN IF NOT EXISTS landlord_email text DEFAULT 'landlord@mobin.ph',
ADD COLUMN IF NOT EXISTS landlord_phone text DEFAULT '+63 918 000 0000',
ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'Studio',
ADD COLUMN IF NOT EXISTS description text DEFAULT '',
ADD COLUMN IF NOT EXISTS city text DEFAULT 'Metro Manila',
ADD COLUMN IF NOT EXISTS image text DEFAULT '',
ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS verification text DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS verification_notes text DEFAULT 'Awaiting Admin Review & Verification',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Populate default values for any legacy properties in table
UPDATE public.properties 
SET 
  status = COALESCE(status, 'Pending'),
  verification = COALESCE(verification, 'Pending'),
  verification_status = COALESCE(verification_status, 'Pending'),
  property_type = COALESCE(property_type, 'Studio'),
  description = COALESCE(description, ''),
  city = COALESCE(city, 'Metro Manila')
WHERE verification IS NULL OR verification = '' OR status IS NULL OR status = '';

-- 3. Ensure Row Level Security (RLS) allows reading, inserting, and updating
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read properties" ON public.properties;
CREATE POLICY "Allow public read properties" 
ON public.properties FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert properties" ON public.properties;
CREATE POLICY "Allow public insert properties" 
ON public.properties FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update properties" ON public.properties;
CREATE POLICY "Allow public update properties" 
ON public.properties FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow public delete properties" ON public.properties;
CREATE POLICY "Allow public delete properties" 
ON public.properties FOR DELETE 
USING (true);
