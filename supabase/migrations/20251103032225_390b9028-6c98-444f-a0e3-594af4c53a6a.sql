-- Add is_sponsored column to products table
ALTER TABLE public.products 
ADD COLUMN is_sponsored boolean DEFAULT false;

-- Drop the old sponsored_products table
DROP TABLE IF EXISTS public.sponsored_products;