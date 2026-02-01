import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";

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
      const qs = new URLSearchParams();
      if (formType) qs.set('form_type', formType);
      if (programId) qs.set('program_id', programId);
      const res: any = await apiFetch(`/api/custom-fields?${qs.toString()}`);
      return res.fields as CustomFormField[];
    },
  });
}

export function useAllCustomFormFields() {
  return useQuery({
    queryKey: ['custom-form-fields-all'],
    queryFn: async () => {
      const res: any = await apiFetch('/api/custom-fields/admin/all');
      return res.fields as CustomFormField[];
    },
  });
}

export function useCreateCustomFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (field: FormFieldInput) => {
      const res: any = await apiFetch('/api/custom-fields', { method: 'POST', body: JSON.stringify(field) });
      return res.field;
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
      const res: any = await apiFetch(`/api/custom-fields/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      return res.field;
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
      await apiFetch(`/api/custom-fields/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-form-fields-all'] });
    },
  });
}
