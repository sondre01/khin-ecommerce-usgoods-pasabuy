-- ==============================================================================
-- US Goods PasaBuy • Supabase Public Schema Migration
-- Run this script in the Supabase Dashboard -> SQL Editor (Project: hynwlirtofxkqzsxotia)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT '',
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) DEFAULT '',
    role VARCHAR(20) DEFAULT 'CUSTOMER' NOT NULL,
    shipping_address JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    retailer_name VARCHAR(100),
    source_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    weight_lbs NUMERIC(6, 2) DEFAULT 1.00 NOT NULL,
    base_price_usd NUMERIC(10, 2) NOT NULL,
    selling_price_php NUMERIC(12, 2) NOT NULL,
    is_custom_request BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    stock_quantity INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(30),
    status VARCHAR(50) DEFAULT 'ORDER_PLACED' NOT NULL,
    payment_plan VARCHAR(30) DEFAULT 'DOWNPAYMENT_50' NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'UNPAID' NOT NULL,
    
    subtotal_php NUMERIC(12, 2) NOT NULL,
    shipping_fee_ph_php NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount_php NUMERIC(12, 2) NOT NULL,
    amount_paid_php NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    remaining_balance_php NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount_php - amount_paid_php) STORED,

    us_store_order_ref VARCHAR(100),
    cargo_tracking_number VARCHAR(100),
    local_courier_name VARCHAR(50),
    local_tracking_number VARCHAR(100),
    
    delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    source_url TEXT,
    variant_details JSONB DEFAULT '{}'::jsonb,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    unit_price_usd NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    unit_price_php NUMERIC(12, 2) NOT NULL,
    landed_cost_snapshot JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    comment TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount_php NUMERIC(12, 2) NOT NULL CHECK (amount_php > 0),
    payment_type VARCHAR(30) DEFAULT 'DOWNPAYMENT_50' NOT NULL,
    method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    proof_receipt_url TEXT,
    review_status VARCHAR(30) DEFAULT 'PENDING_REVIEW' NOT NULL,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. RESTOCK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.restock_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_title VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(150),
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INDEXES FOR HIGH QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_restock_product_id ON public.restock_requests(product_id);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;

-- POLICIES: ALLOW PUBLIC READ OF PRODUCTS
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- POLICIES: USERS TABLE
DROP POLICY IF EXISTS "Allow user operations" ON public.users;
CREATE POLICY "Allow user operations" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- POLICIES: ORDERS & ITEMS
DROP POLICY IF EXISTS "Allow order operations" ON public.orders;
CREATE POLICY "Allow order operations" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow order items operations" ON public.order_items;
CREATE POLICY "Allow order items operations" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- POLICIES: PAYMENTS
DROP POLICY IF EXISTS "Allow payments operations" ON public.payments;
CREATE POLICY "Allow payments operations" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- POLICIES: RESTOCK
DROP POLICY IF EXISTS "Allow restock operations" ON public.restock_requests;
CREATE POLICY "Allow restock operations" ON public.restock_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- GRANTS FOR POSTGREST DATA API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
