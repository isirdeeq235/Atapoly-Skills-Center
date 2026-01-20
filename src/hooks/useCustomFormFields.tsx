import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomFormField {
  id: string;
  form_type: 'profile' | 'application';
  field_name: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio' | 'file';
  field_options: string[];
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  validation_rules: Record<string, any>;
  display_order: number;
  is_active: boolean;
  program_id: string | null;
  created_at: string;
  updated_at: string;
}

export type FormFieldInput = Omit<CustomFormField, 'id' | 'created_at' | 'updated_at'>;

export function useCustomFormFields(formType?: 'profile' | 'application', programId?: string) {
  return useQuery({
    queryKey: ['custom-form-fields', formType, programId],
    queryFn: async () => {
      let query = supabase
        .from('custom_form_fields')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (formType) {
        query = query.eq('form_type', formType);
      }

      if (formType === 'application' && programId) {
        query = query.or(`program_id.eq.${programId},program_id.is.null`);
      } else if (formType === 'profile') {
        query = query.is('program_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CustomFormField[];
    },
  });
}

export function useAllCustomFormFields() {
  return useQuery({
    queryKey: ['custom-form-fields-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_form_fields')
        .select('*')
        .order('form_type')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CustomFormField[];
    },
  });
}

export function useCreateCustomFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (field: FormFieldInput) => {
      const { data, error } = await supabase
        .from('custom_form_fields')
        .insert(field)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields-all'] });
    },
  });
}

export function useUpdateCustomFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomFormField> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_form_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields-all'] });
    },
  });
}

export function useDeleteCustomFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_form_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields-all'] });
    },
  });
}
