-- ==========================================
-- PitStop Delivery - Supabase Schema
-- Execute este SQL no SQL Editor do Supabase
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS delivery_areas CASCADE;
DROP TABLE IF EXISTS additionals CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  logo_url TEXT,
  cover_url TEXT,
  is_open BOOLEAN DEFAULT true,
  opening_hours VARCHAR(100),
  min_order DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_time VARCHAR(50),
  payment_methods TEXT[],
  theme_color VARCHAR(20) DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  prep_time VARCHAR(50),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additionals table
CREATE TABLE additionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery areas table
CREATE TABLE delivery_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('local', 'takeaway', 'delivery')),
  address TEXT,
  delivery_area VARCHAR(100),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  observations TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  additionals JSONB,
  additionals_total DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL
);

-- Create indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE additionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES FOR BUSINESSES
-- ==========================================
-- Anyone can view businesses (for public menus)
CREATE POLICY "Public can view businesses" ON businesses 
  FOR SELECT USING (true);

-- Authenticated users can insert their own businesses
CREATE POLICY "Users can insert own businesses" ON businesses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses" ON businesses 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses" ON businesses 
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- POLICIES FOR CATEGORIES
-- ==========================================
-- Anyone can view categories (for public menus)
CREATE POLICY "Public can view categories" ON categories 
  FOR SELECT USING (true);

-- Business owners can insert categories
CREATE POLICY "Business owners can insert categories" ON categories 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can update categories
CREATE POLICY "Business owners can update categories" ON categories 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can delete categories
CREATE POLICY "Business owners can delete categories" ON categories 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ==========================================
-- POLICIES FOR PRODUCTS
-- ==========================================
-- Anyone can view products (for public menus)
CREATE POLICY "Public can view products" ON products 
  FOR SELECT USING (true);

-- Business owners can insert products
CREATE POLICY "Business owners can insert products" ON products 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can update products
CREATE POLICY "Business owners can update products" ON products 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can delete products
CREATE POLICY "Business owners can delete products" ON products 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ==========================================
-- POLICIES FOR ADDITIONALS
-- ==========================================
-- Anyone can view additionals (for public menus)
CREATE POLICY "Public can view additionals" ON additionals 
  FOR SELECT USING (true);

-- Business owners can insert additionals
CREATE POLICY "Business owners can insert additionals" ON additionals 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can update additionals
CREATE POLICY "Business owners can update additionals" ON additionals 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can delete additionals
CREATE POLICY "Business owners can delete additionals" ON additionals 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ==========================================
-- POLICIES FOR DELIVERY_AREAS
-- ==========================================
-- Anyone can view delivery areas (for public menus)
CREATE POLICY "Public can view delivery_areas" ON delivery_areas 
  FOR SELECT USING (true);

-- Business owners can insert delivery areas
CREATE POLICY "Business owners can insert delivery_areas" ON delivery_areas 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can update delivery areas
CREATE POLICY "Business owners can update delivery_areas" ON delivery_areas 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Business owners can delete delivery areas
CREATE POLICY "Business owners can delete delivery_areas" ON delivery_areas 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ==========================================
-- POLICIES FOR ORDERS
-- ==========================================
-- Business owners can view their orders
CREATE POLICY "Business owners can view orders" ON orders 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- Anyone can insert orders (customers placing orders)
CREATE POLICY "Anyone can insert orders" ON orders 
  FOR INSERT WITH CHECK (true);

-- Business owners can update their orders
CREATE POLICY "Business owners can update orders" ON orders 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ==========================================
-- POLICIES FOR ORDER_ITEMS
-- ==========================================
-- Business owners can view their order items
CREATE POLICY "Business owners can view order_items" ON order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o 
      JOIN businesses b ON o.business_id = b.id 
      WHERE o.id = order_id AND b.user_id = auth.uid()
    )
  );

-- Anyone can insert order items (when placing orders)
CREATE POLICY "Anyone can insert order_items" ON order_items 
  FOR INSERT WITH CHECK (true);
