-- Update admin email to kbtiwari228171@gmail.com
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Remove admin role from kbtiwari@gmail.com if exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'kbtiwari@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'admin';
  END IF;
  
  -- Assign admin role to kbtiwari228171@gmail.com (if exists)
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'kbtiwari228171@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;