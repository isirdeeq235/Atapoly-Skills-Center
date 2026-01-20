import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject_template: string;
  html_template: string;
  is_enabled: boolean;
  description: string | null;
  available_placeholders: string[];
  created_at: string;
  updated_at: string;
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      return data as EmailTemplate[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmailTemplate(templateKey: string) {
  return useQuery({
    queryKey: ['email-template', templateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', templateKey)
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    },
    enabled: !!templateKey,
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template'] });
    },
  });
}
