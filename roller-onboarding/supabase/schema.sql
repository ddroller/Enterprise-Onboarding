-- ROLLER Enterprise Onboarding — Supabase Schema
-- Run this in the Supabase SQL Editor (Settings → SQL Editor → New Query)

-- 1. Customers table: stores setup config for each customer instance
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,            -- URL-safe identifier, e.g. "wrts", "skyzone"
  customer_name TEXT NOT NULL,           -- Display name, e.g. "We Rock the Spectrum"
  model TEXT NOT NULL CHECK (model IN ('growth', 'centralized')),
  logo_url TEXT,                         -- Base64 data URL or hosted image URL
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Custom documents table: stores template overrides per customer
CREATE TABLE custom_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,             -- Matches the template ID in the app (e.g. "impl-hub")
  document_name TEXT NOT NULL,           -- Customer-facing name, e.g. "WRTS — Enterprise Implementation Hub"
  document_url TEXT NOT NULL,            -- URL to the customer-specific Google Doc/Sheet/Slides
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, template_id)       -- One override per template per customer
);

-- 3. Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER custom_documents_updated_at
  BEFORE UPDATE ON custom_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Row Level Security (RLS)
-- Enable RLS but allow public read/write via the anon key.
-- This is appropriate because there's no user auth — access is controlled by knowing the URL slug.
-- If you add auth later, tighten these policies.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on customers"
  ON customers FOR SELECT USING (true);

CREATE POLICY "Allow public insert on customers"
  ON customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on customers"
  ON customers FOR UPDATE USING (true);

CREATE POLICY "Allow public read on custom_documents"
  ON custom_documents FOR SELECT USING (true);

CREATE POLICY "Allow public insert on custom_documents"
  ON custom_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on custom_documents"
  ON custom_documents FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on custom_documents"
  ON custom_documents FOR DELETE USING (true);

-- 5. Indexes for performance
CREATE INDEX idx_customers_slug ON customers(slug);
CREATE INDEX idx_custom_documents_customer_id ON custom_documents(customer_id);
