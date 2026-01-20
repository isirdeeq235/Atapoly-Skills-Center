import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('id_card_template')
        .select('*')
        .single();

      if (error) throw error;
      return data as IdCardTemplate;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateIdCardTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<IdCardTemplate>) => {
      const { data: existing } = await supabase
        .from('id_card_template')
        .select('id')
        .single();

      if (!existing) throw new Error('ID card template not found');

      const { data, error } = await supabase
        .from('id_card_template')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('certificate_template')
        .select('*')
        .single();

      if (error) throw error;
      return data as CertificateTemplate;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CertificateTemplate>) => {
      const { data: existing } = await supabase
        .from('certificate_template')
        .select('id')
        .single();

      if (!existing) throw new Error('Certificate template not found');

      const { data, error } = await supabase
        .from('certificate_template')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('template_key');

      if (error) throw error;
      return data as NotificationTemplate[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NotificationTemplate> }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}
