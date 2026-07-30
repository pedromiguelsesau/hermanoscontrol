-- Hermano's Control ERP — Supabase schema + RLS
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Replaces the old single-blob `erp_data` table with real tables.
-- Access model: any authenticated user (Supabase Auth) has full read/write.
-- No public/anon access — everything requires login.

create extension if not exists "pgcrypto";

-- ---------- Singletons (one row each) ----------
create table if not exists company_config (
  id int primary key default 1 check (id = 1),
  name text, cnpj text, phone text, email text, instagram text, address text, currency text
);

create table if not exists financial_state (
  id int primary key default 1 check (id = 1),
  accounts_payable numeric default 0,
  accounts_receivable numeric default 0,
  installments numeric default 0,
  profit numeric default 0,
  withdrawals numeric default 0,
  assets_value numeric default 0,
  available_balance numeric default 0
);

create table if not exists site_config (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb -- full SiteConfig blob (collections/categories/banners/versions nested)
);

-- ---------- Core entities ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text, name text, category text, brand text, color text, size text,
  description text, photos text[] default '{}',
  cost_price numeric default 0, sell_price numeric default 0, margin numeric default 0,
  stock int default 0, initial_stock int default 0, min_stock_alert int,
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_code text, product_name text, color text, size text,
  type text check (type in ('ENTRADA','SAIDA','AJUSTE')),
  quantity int, date timestamptz default now(), reason text, "user" text
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text, phone text, email text, notes text,
  total_spent numeric default 0, purchase_count int default 0,
  created_at timestamptz default now(), last_purchase_date timestamptz
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  supplier text, date timestamptz default now(), payment_method text, notes text,
  freight numeric default 0, total_amount numeric default 0,
  items jsonb not null default '[]'::jsonb, -- PurchaseItem[]
  receipt_url text, created_at timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  customer_name text, date timestamptz default now(),
  items jsonb not null default '[]'::jsonb, -- SaleItem[]
  discount numeric default 0, freight numeric default 0,
  total_amount numeric default 0, profit_amount numeric default 0,
  payment_method text, salesperson text, notes text,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text, description text, amount numeric default 0,
  date timestamptz default now(), payment_method text, receipt_url text, notes text,
  created_at timestamptz default now()
);

create table if not exists cash_flow (
  id uuid primary key default gen_random_uuid(),
  date timestamptz default now(), type text check (type in ('ENTRADA','SAIDA')),
  category text, description text, amount numeric default 0,
  balance_after numeric default 0, payment_method text, reference_id text
);

create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text, budget numeric default 0, spent numeric default 0,
  start_date timestamptz, end_date timestamptz, channel text,
  discount_code text, discount_percentage numeric,
  sales_count int default 0, revenue_generated numeric default 0, roas numeric default 0,
  status text check (status in ('Ativa','Pausada','Finalizada'))
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  month_year text, target_revenue numeric default 0, target_profit numeric default 0,
  target_sales_count int default 0, target_items_count int default 0
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text, date timestamptz, time text, type text, category text,
  notes text, description text, completed boolean default false
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text, assignee text, priority text, completed boolean default false,
  status text, due_date timestamptz, notes text, created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(), date_formatted text,
  "user" text, module text, entity text, entity_id text,
  action text, details text, old_value text, new_value text
);

create table if not exists trash (
  id uuid primary key default gen_random_uuid(),
  original_id text, type text, original_name text, payload jsonb,
  deleted_at timestamptz default now(), expires_at timestamptz, description text
);

create table if not exists media_library (
  id uuid primary key default gen_random_uuid(),
  name text, url text, category text, size int, size_formatted text,
  mime_type text, uploaded_at timestamptz default now(), uploaded_by text,
  width int, height int
);

-- ---------- RLS: enable + "authenticated users only" on everything ----------
do $$
declare t text;
begin
  for t in select unnest(array[
    'company_config','financial_state','site_config','products','stock_movements',
    'customers','purchases','sales','expenses','cash_flow','marketing_campaigns',
    'goals','calendar_events','tasks','audit_logs','trash','media_library'
  ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "authenticated_full_access" on %I;', t);
    execute format(
      'create policy "authenticated_full_access" on %I for all to authenticated using (true) with check (true);', t
    );
  end loop;
end $$;

-- Seed the two singleton rows so the app always has one to read/update.
insert into company_config (id) values (1) on conflict (id) do nothing;
insert into financial_state (id) values (1) on conflict (id) do nothing;
insert into site_config (id) values (1) on conflict (id) do nothing;
