import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export interface PaymentSettings {
  // Public-safe fields (readable by all authenticated users)
  paystack_public_key?: string | null;
  flutterwave_public_key?: string | null;
  paystack_enabled?: boolean;
  flutterwave_enabled?: boolean;
  created_at?: string;
  updated_at?: string;

  // NOTE: Sensitive keys are stored server-side and are not exposed to clients.
  paystack_secret_key?: string | null;
  flutterwave_secret_key?: string | null;
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/payment_settings');
      return (data ?? null) as PaymentSettings | null;
    },
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<PaymentSettings>) => {
      const data = await apiFetch('/api/site-config/payment_settings', { method: 'PUT', body: JSON.stringify(updates) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });
} 
