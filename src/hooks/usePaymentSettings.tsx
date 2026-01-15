import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentSettings {
  id: string;
  // Public-safe fields (readable by all authenticated users)
  paystack_public_key: string | null;
  flutterwave_public_key: string | null;
  paystack_enabled: boolean;
  flutterwave_enabled: boolean;
  created_at: string;
  updated_at: string;

  // NOTE: Sensitive keys are stored server-side and are not exposed to clients.
  // Kept optional for backward-compat with existing code paths.
  paystack_secret_key?: string | null;
  flutterwave_secret_key?: string | null;
  singleton?: boolean;
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      // IMPORTANT: trainees cannot read from `payment_settings` (sensitive table).
      // This public-safe table is kept in sync server-side.
      const { data, error } = await supabase
        .from('payment_settings_public')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as PaymentSettings | null;
    },
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<PaymentSettings>) => {
      const { data: existing } = await supabase
        .from('payment_settings')
        .select('id')
        .single();

      if (!existing) throw new Error('Payment settings not found');

      const { data, error } = await supabase
        .from('payment_settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });
}
