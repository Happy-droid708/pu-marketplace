-- Update RLS policy to allow viewing all products (including sold ones)
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;

CREATE POLICY "Anyone can view all products" 
ON public.products 
FOR SELECT 
USING (true);