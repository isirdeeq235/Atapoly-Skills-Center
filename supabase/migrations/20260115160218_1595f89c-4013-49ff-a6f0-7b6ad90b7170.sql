-- Add INSERT policy for site_config for super admins
CREATE POLICY "Super admin can insert site config"
ON public.site_config
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Add INSERT policy for payment_settings for super admins
CREATE POLICY "Super admin can insert payment settings"
ON public.payment_settings
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));