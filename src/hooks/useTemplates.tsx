import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { Json } from '@/integrations/supabase/types';

export interface IdCardTemplate {
  id: string;
  background_color: string;
  text_color: string;
  header_text: string;
  show_logo: boolean;
  show_qr_code: boolean;
  show_photo: boolean;
  show_registration_number: boolean;
  show_program: boolean;
  show_batch: boolean;
  show_validity_date: boolean;
  show_emergency_contact: boolean;
  custom_fields: Json;
  footer_text: string;
  card_width: number;
  card_height: number;
}

export interface CertificateTemplate {
  id: string;
  border_style: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  header_text: string;
  subheader_text: string;
  body_template: string;
  footer_text: string;
  show_logo: boolean;
  show_signature: boolean;
  show_certificate_number: boolean;
  show_qr_code: boolean;
  signature_title: string;
  signature_name: string | null;
  paper_size: string;
  orientation: string;
}

export interface NotificationTemplate {
  id: string;
  template_key: string;
  title_template: string;
  message_template: string;
  is_enabled: boolean;
}

// ID Card Template
export function useIdCardTemplate() {
  return useQuery({
    queryKey: ['id-card-template'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/id_card_template');
      return data as IdCardTemplate;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateIdCardTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<IdCardTemplate>) => {
      const data = await apiFetch('/api/site-config/id_card_template', { method: 'PUT', body: JSON.stringify(updates) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['id-card-template'] });
    },
  });
}

// Certificate Template
export function useCertificateTemplate() {
  return useQuery({
    queryKey: ['certificate-template'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/certificate_template');
      return data as CertificateTemplate;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CertificateTemplate>) => {
      const data = await apiFetch('/api/site-config/certificate_template', { method: 'PUT', body: JSON.stringify(updates) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-template'] });
    },
  });
}

// Notification Templates
export function useNotificationTemplates() {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const data = await apiFetch('/api/site-config/notification_templates');
      return (data || []) as NotificationTemplate[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NotificationTemplate> }) => {
      // We store notification templates as a keyed array under site-config; admin UI should send the updated array
      const data = await apiFetch('/api/site-config/notification_templates', { method: 'PUT', body: JSON.stringify({ id, updates }) });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}
