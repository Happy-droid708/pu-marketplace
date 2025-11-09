-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Sellers can add comments to own products" ON public.product_comments;

-- Create new policy allowing sellers to comment on any product
CREATE POLICY "Sellers can add comments to any product" 
ON public.product_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = seller_id 
  AND has_role(auth.uid(), 'seller'::app_role)
  AND EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_comments.product_id 
    AND products.is_available = true
  )
  AND (
    SELECT COUNT(*) 
    FROM product_comments 
    WHERE product_comments.product_id = product_comments.product_id 
    AND product_comments.seller_id = auth.uid()
  ) < 10
);