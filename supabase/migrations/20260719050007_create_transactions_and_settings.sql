/*
# Personal Finance 50/30/20 — Schema

1. Purpose
   Single-tenant personal finance app (no sign-in). Stores transactions
   (income/expenses), a budget profile (monthly income + 50/30/20 split),
   and expense categories. Data is intentionally shared/local to this app
   instance, so anon+authenticated CRUD is allowed.

2. New Tables
   - `transactions`
     - id (uuid, pk)
     - type (text: 'income' | 'expense', not null)
     - amount (numeric(12,2), not null, check > 0)
     - category (text, not null) — free-form label, e.g. 'Rent', 'Salary'
     - bucket (text, nullable) — for expenses: 'needs' | 'wants' | 'savings'
     - description (text, nullable)
     - date (date, not null)
     - created_at (timestamptz, default now())
   - `settings`
     - id (uuid, pk)
     - monthly_income (numeric(12,2), not null, default 0)
     - needs_pct (numeric(5,2), default 50.00, check 0..100)
     - wants_pct (numeric(5,2), default 30.00, check 0..100)
     - savings_pct (numeric(5,2), default 20.00, check 0..100)
     - currency (text, default 'USD')
     - updated_at (timestamptz, default now())

3. Security
   - RLS enabled on both tables.
   - anon + authenticated full CRUD (single-tenant, intentionally shared).

4. Notes
   - Single settings row enforced by app logic (upsert on a fixed id).
   - Amounts stored as numeric for precision; frontend formats for display.
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income','expense')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL,
  bucket text CHECK (bucket IS NULL OR bucket IN ('needs','wants','savings')),
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions (type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_income numeric(12,2) NOT NULL DEFAULT 0,
  needs_pct numeric(5,2) NOT NULL DEFAULT 50.00 CHECK (needs_pct >= 0 AND needs_pct <= 100),
  wants_pct numeric(5,2) NOT NULL DEFAULT 30.00 CHECK (wants_pct >= 0 AND wants_pct <= 100),
  savings_pct numeric(5,2) NOT NULL DEFAULT 20.00 CHECK (savings_pct >= 0 AND savings_pct <= 100),
  currency text NOT NULL DEFAULT 'USD',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
  TO anon, authenticated USING (true);
