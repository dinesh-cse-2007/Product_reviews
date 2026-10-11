/*
# Create products and reviews tables (single-tenant, no auth)

## Overview
This migration creates the core schema for a product review platform.
Since this is a public, no-sign-in app, all data is intentionally shared
and readable/writable by anyone (anon + authenticated roles).

## New Tables

### products
- `id` (uuid, primary key) — auto-generated unique identifier
- `name` (text, not null) — product name
- `description` (text, not null) — product description
- `category` (text, not null) — product category (e.g. "Electronics", "Home")
- `image_url` (text, not null) — URL to product image
- `created_at` (timestamptz) — when the product was added, defaults to now()

### reviews
- `id` (uuid, primary key) — auto-generated unique identifier
- `product_id` (uuid, not null) — foreign key to products, cascading on delete
- `author_name` (text, not null) — name of the reviewer
- `rating` (integer, not null) — star rating from 1 to 5, CHECK constraint enforced
- `comment` (text, not null) — review text
- `created_at` (timestamptz) — when the review was submitted, defaults to now()

## Indexes
- Index on `reviews.product_id` for fast lookups when loading a product's reviews
- Index on `products.category` for fast category filtering

## Security
- RLS enabled on both tables.
- All CRUD operations allowed for anon + authenticated roles since the data
  is intentionally public/shared (no sign-in screen in this app).
- `USING (true)` and `WITH CHECK (true)` are appropriate here because the
  app is single-tenant with no user isolation requirements.

## Important Notes
1. The `reviews.rating` column has a CHECK constraint ensuring values 1–5 only.
2. Deleting a product cascades to delete its reviews (ON DELETE CASCADE).
3. All policies use `TO anon, authenticated` so the anon-key frontend client
   can read and write data without requiring authentication.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);