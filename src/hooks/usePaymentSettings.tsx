import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentSettings {
  id: string;
  paystack_public_key: string | null;
  paystack_secret_key: string | null;
  paystack_enabled: boolean;
  flutterwave_public_key: string | null;
  flutterwave_secret_key: string | null;
  flutterwave_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as PaymentSettings;
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
