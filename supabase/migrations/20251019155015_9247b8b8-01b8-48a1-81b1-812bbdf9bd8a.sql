-- Create category enum with 5 fixed options
CREATE TYPE public.product_category AS ENUM (
  'Study Material',
  'Foods',
  'Rooms',
  'Vehicle',
  'Kitchen Accessories'
);

-- First, update existing products to map to closest category or default
UPDATE public.products 
SET category = CASE 
  WHEN category ILIKE '%study%' OR category ILIKE '%book%' OR category ILIKE '%material%' THEN 'Study Material'
  WHEN category ILIKE '%food%' OR category ILIKE '%meal%' OR category ILIKE '%snack%' THEN 'Foods'
  WHEN category ILIKE '%room%' OR category ILIKE '%accommodation%' THEN 'Rooms'
  WHEN category ILIKE '%vehicle%' OR category ILIKE '%car%' OR category ILIKE '%bike%' THEN 'Vehicle'
  WHEN category ILIKE '%kitchen%' OR category ILIKE '%utensil%' THEN 'Kitchen Accessories'
  ELSE 'Study Material'
END;

-- Now alter the column to use enum
ALTER TABLE public.products 
ALTER COLUMN category TYPE product_category USING category::product_category;

ALTER TABLE public.products 
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN category SET DEFAULT 'Study Material'::product_category;

-- Create product_likes table
CREATE TABLE public.product_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS on product_likes
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_likes
CREATE POLICY "Anyone can view likes"
ON public.product_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like products"
ON public.product_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.product_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create product_comments table
CREATE TABLE public.product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_comments
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_comments
CREATE POLICY "Anyone can view comments"
ON public.product_comments FOR SELECT
USING (true);

CREATE POLICY "Sellers can add comments to own products"
ON public.product_comments FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_id AND seller_id = auth.uid()
  ) AND
  (SELECT COUNT(*) FROM public.product_comments WHERE product_id = product_comments.product_id AND seller_id = auth.uid()) < 10
);

CREATE POLICY "Sellers can update own comments"
ON public.product_comments FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own comments"
ON public.product_comments FOR DELETE
USING (auth.uid() = seller_id);

-- Create trigger for updated_at on comments
CREATE TRIGGER update_product_comments_updated_at
BEFORE UPDATE ON public.product_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX idx_product_likes_user_id ON public.product_likes(user_id);
CREATE INDEX idx_product_comments_product_id ON public.product_comments(product_id);
CREATE INDEX idx_product_comments_seller_id ON public.product_comments(seller_id);