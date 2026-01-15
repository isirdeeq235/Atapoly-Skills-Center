import { usePaymentSettings } from "./usePaymentSettings";

export type PaymentProvider = "paystack" | "flutterwave" | null;

export function useActivePaymentProvider() {
  const { data: paymentSettings, isLoading, error } = usePaymentSettings();

  // Only return a provider if it's enabled
  // Priority: Paystack first if enabled, then Flutterwave
  const getActiveProvider = (): PaymentProvider => {
    if (!paymentSettings) return null;
    if (paymentSettings.paystack_enabled) return "paystack";
    if (paymentSettings.flutterwave_enabled) return "flutterwave";
    return null;
  };

  return {
    provider: getActiveProvider(),
    isLoading,
    error,
    hasActiveProvider: !!getActiveProvider(),
    paymentSettings,
  };
}
