-- Migration to add colors and sku columns to products table
-- Execute this SQL in your Supabase SQL Editor

-- Add colors column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- Add sku column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- Add comments to the columns
COMMENT ON COLUMN products.colors IS 'Array of product colors with name and hex values';
COMMENT ON COLUMN products.sku IS 'Código único do produto (Stock Keeping Unit)';

-- Create index for SKU for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Example of how the colors data should look:
-- [
--   {"name": "Preto", "hex": "#000000"},
--   {"name": "Branco", "hex": "#FFFFFF"},
--   {"name": "Azul", "hex": "#0066CC"}
-- ]
-- Example SKU: "IPH15PM-256-BLK"