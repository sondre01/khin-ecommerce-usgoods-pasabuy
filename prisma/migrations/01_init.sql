-- Migration: 01_init.sql
-- US Goods PasaBuy Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');

CREATE TYPE order_status AS ENUM (
    'PENDING_QUOTE',
    'ORDER_PLACED',
    'PURCHASED_IN_US',
    'IN_TRANSIT_FORWARDER',
    'ARRIVED_IN_PH',
    'OUT_FOR_LOCAL_DELIVERY',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE payment_option AS ENUM ('FULL_PAYMENT', 'DOWNPAYMENT_50');

CREATE TYPE payment_status AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'FULLY_PAID',
    'REFUNDED'
);

CREATE TYPE payment_method AS ENUM (
    'GCASH',
    'MAYA',
    'BDO_BANK_TRANSFER',
    'BPI_BANK_TRANSFER',
    'CREDIT_CARD',
    'CASH_ON_PICKUP'
);

CREATE TYPE receipt_review_status AS ENUM (
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);

-- 2. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    role user_role DEFAULT 'CUSTOMER' NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 4. ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status order_status DEFAULT 'PENDING_QUOTE' NOT NULL,
    payment_plan payment_option DEFAULT 'DOWNPAYMENT_50' NOT NULL,
    payment_status payment_status DEFAULT 'UNPAID' NOT NULL,
    
    subtotal_php NUMERIC(12, 2) NOT NULL,
    shipping_fee_ph_php NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount_php NUMERIC(12, 2) NOT NULL,
    amount_paid_php NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    remaining_balance_php NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount_php - amount_paid_php) STORED,

    us_store_order_ref VARCHAR(100),
    cargo_tracking_number VARCHAR(100),
    local_courier_name VARCHAR(50),
    local_tracking_number VARCHAR(100),
    
    delivery_address JSONB NOT NULL,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    source_url TEXT,
    variant_details JSONB,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    unit_price_php NUMERIC(12, 2) NOT NULL,
    landed_cost_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. STATUS LOGS
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stage order_status NOT NULL,
    comment TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. PAYMENTS & RECEIPTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount_php NUMERIC(12, 2) NOT NULL CHECK (amount_php > 0),
    payment_type payment_option NOT NULL,
    method payment_method NOT NULL,
    reference_number VARCHAR(100),
    proof_receipt_url TEXT NOT NULL,
    review_status receipt_review_status DEFAULT 'PENDING_REVIEW' NOT NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INDEXES
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_review_status ON payments(review_status);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
