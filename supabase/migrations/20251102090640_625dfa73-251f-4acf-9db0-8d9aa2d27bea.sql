-- Create table for admin-sponsored products
CREATE TABLE public.sponsored_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Enable RLS
ALTER TABLE public.sponsored_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view sponsored products
CREATE POLICY "Anyone can view sponsored products"
ON public.sponsored_products
FOR SELECT
USING (true);

-- Only admins can manage sponsored products
CREATE POLICY "Admins can insert sponsored products"
ON public.sponsored_products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsored products"
ON public.sponsored_products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsored products"
ON public.sponsored_products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for sponsored products
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsored_products;