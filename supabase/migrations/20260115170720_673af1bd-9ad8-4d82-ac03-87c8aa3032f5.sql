-- Public-safe payment settings for all authenticated users

CREATE TABLE IF NOT EXISTS public.payment_settings_public (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
  paystack_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  flutterwave_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  paystack_public_key TEXT NULL,
  flutterwave_public_key TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings_public ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read the public-safe settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_settings_public'
      AND policyname = 'Authenticated can view public payment settings'
  ) THEN
    CREATE POLICY "Authenticated can view public payment settings"
      ON public.payment_settings_public
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Only super admins can modify (typically via trigger + super-admin updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_settings_public'
      AND policyname = 'Only super admin can manage public payment settings'
  ) THEN
    CREATE POLICY "Only super admin can manage public payment settings"
      ON public.payment_settings_public
      FOR ALL
      TO authenticated
      USING (public.is_super_admin(auth.uid()))
      WITH CHECK (public.is_super_admin(auth.uid()));
  END IF;
END $$;

-- Keep public table in sync with the sensitive payment_settings table
CREATE OR REPLACE FUNCTION public.sync_payment_settings_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_settings_public (
    singleton,
    paystack_enabled,
    flutterwave_enabled,
    paystack_public_key,
    flutterwave_public_key,
    updated_at
  ) VALUES (
    TRUE,
    NEW.paystack_enabled,
    NEW.flutterwave_enabled,
    NEW.paystack_public_key,
    NEW.flutterwave_public_key,
    now()
  )
  ON CONFLICT (singleton)
  DO UPDATE SET
    paystack_enabled = EXCLUDED.paystack_enabled,
    flutterwave_enabled = EXCLUDED.flutterwave_enabled,
    paystack_public_key = EXCLUDED.paystack_public_key,
    flutterwave_public_key = EXCLUDED.flutterwave_public_key,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_payment_settings_public ON public.payment_settings;
CREATE TRIGGER trg_sync_payment_settings_public
AFTER INSERT OR UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.sync_payment_settings_public();

-- Seed/repair the public row from existing settings (if any)
INSERT INTO public.payment_settings_public (
  singleton,
  paystack_enabled,
  flutterwave_enabled,
  paystack_public_key,
  flutterwave_public_key,
  updated_at
)
SELECT
  TRUE,
  ps.paystack_enabled,
  ps.flutterwave_enabled,
  ps.paystack_public_key,
  ps.flutterwave_public_key,
  now()
FROM public.payment_settings ps
ORDER BY ps.created_at ASC
LIMIT 1
ON CONFLICT (singleton)
DO UPDATE SET
  paystack_enabled = EXCLUDED.paystack_enabled,
  flutterwave_enabled = EXCLUDED.flutterwave_enabled,
  paystack_public_key = EXCLUDED.paystack_public_key,
  flutterwave_public_key = EXCLUDED.flutterwave_public_key,
  updated_at = now();
