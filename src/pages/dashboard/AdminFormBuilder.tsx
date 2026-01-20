import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Save, X } from "lucide-react";
import { useAllCustomFormFields, useCreateCustomFormField, useUpdateCustomFormField, useDeleteCustomFormField, CustomFormField, FormFieldInput } from "@/hooks/useCustomFormFields";
import { usePrograms } from "@/hooks/usePrograms";

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'file', label: 'File Upload' },
] as const;

const defaultField: Partial<FormFieldInput> = {
  form_type: 'profile',
  field_name: '',
  field_label: '',
  field_type: 'text',
  field_options: [],
  placeholder: '',
  help_text: '',
  is_required: false,
  validation_rules: {},
  display_order: 0,
  is_active: true,
  program_id: null,
};

export default function AdminFormBuilder() {
  const { toast } = useToast();
  const { data: fields, isLoading } = useAllCustomFormFields();
  const { data: programs } = usePrograms();
  const createField = useCreateCustomFormField();
  const updateField = useUpdateCustomFormField();
  const deleteField = useDeleteCustomFormField();

  const [activeTab, setActiveTab] = useState<'profile' | 'application'>('profile');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Partial<CustomFormField> | null>(null);
  const [optionsInput, setOptionsInput] = useState('');

  const filteredFields = fields?.filter(f => f.form_type === activeTab) || [];

  const handleOpenDialog = (field?: CustomFormField) => {
    if (field) {
      setEditingField(field);
      setOptionsInput((field.field_options || []).join('\n'));
    } else {
      setEditingField({ ...defaultField, form_type: activeTab });
      setOptionsInput('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
    setOptionsInput('');
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    const fieldData: FormFieldInput = {
      form_type: editingField.form_type as 'profile' | 'application',
      field_name: editingField.field_name?.toLowerCase().replace(/\s+/g, '_') || '',
      field_label: editingField.field_label || '',
      field_type: editingField.field_type as FormFieldInput['field_type'],
      field_options: optionsInput.split('\n').filter(o => o.trim()),
      placeholder: editingField.placeholder || null,
      help_text: editingField.help_text || null,
      is_required: editingField.is_required || false,
      validation_rules: editingField.validation_rules || {},
      display_order: editingField.display_order || filteredFields.length,
      is_active: editingField.is_active !== false,
      program_id: editingField.program_id || null,
    };

    try {
      if (editingField.id) {
        await updateField.mutateAsync({ id: editingField.id, ...fieldData });
        toast({ title: "Field updated successfully" });
      } else {
        await createField.mutateAsync(fieldData);
        toast({ title: "Field created successfully" });
      }
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: "Error saving field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;

    try {
      await deleteField.mutateAsync(id);
      toast({ title: "Field deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error deleting field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (field: CustomFormField) => {
    try {
      await updateField.mutateAsync({ id: field.id, is_active: !field.is_active });
      toast({ title: `Field ${field.is_active ? 'disabled' : 'enabled'}` });
    } catch (error: any) {
      toast({
        title: "Error updating field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const needsOptions = ['select', 'radio'].includes(editingField?.field_type || '');

  return (
    <DashboardLayout role="super-admin" title="Form Builder" subtitle="Create and manage custom form fields">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Add custom fields to trainee profiles and program applications without code changes.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingField?.id ? 'Edit Field' : 'Create New Field'}</DialogTitle>
                <DialogDescription>
                  Configure the field properties. It will appear in the {activeTab} form.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Form Type</Label>
                    <Select
                      value={editingField?.form_type || 'profile'}
                      onValueChange={(v) => setEditingField({ ...editingField, form_type: v as 'profile' | 'application' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profile">Profile Form</SelectItem>
                        <SelectItem value="application">Application Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                      value={editingField?.field_type || 'text'}
                      onValueChange={(v) => setEditingField({ ...editingField, field_type: v as FormFieldInput['field_type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field Label *</Label>
                    <Input
                      value={editingField?.field_label || ''}
                      onChange={(e) => setEditingField({ ...editingField, field_label: e.target.value })}
                      placeholder="e.g., Work Experience"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Field Name (auto-generated)</Label>
                    <Input
                      value={(editingField?.field_label || '').toLowerCase().replace(/\s+/g, '_')}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {editingField?.form_type === 'application' && (
                  <div className="space-y-2">
                    <Label>Program (Optional)</Label>
                    <Select
                      value={editingField?.program_id || 'all'}
                      onValueChange={(v) => setEditingField({ ...editingField, program_id: v === 'all' ? null : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs?.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to show this field for all programs
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Placeholder Text</Label>
                  <Input
                    value={editingField?.placeholder || ''}
                    onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                    placeholder="Enter placeholder text..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Help Text</Label>
                  <Input
                    value={editingField?.help_text || ''}
                    onChange={(e) => setEditingField({ ...editingField, help_text: e.target.value })}
                    placeholder="Additional instructions for the user..."
                  />
                </div>

                {needsOptions && (
                  <div className="space-y-2">
                    <Label>Options (one per line) *</Label>
                    <Textarea
                      value={optionsInput}
                      onChange={(e) => setOptionsInput(e.target.value)}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingField?.is_required || false}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_required: checked })}
                    />
                    <Label>Required Field</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingField?.is_active !== false}
                      onCheckedChange={(checked) => setEditingField({ ...editingField, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={editingField?.display_order || 0}
                    onChange={(e) => setEditingField({ ...editingField, display_order: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveField} disabled={!editingField?.field_label}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Field
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'application')}>
          <TabsList>
            <TabsTrigger value="profile">Profile Fields</TabsTrigger>
            <TabsTrigger value="application">Application Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Custom Fields</CardTitle>
                <CardDescription>
                  These fields will appear in the trainee profile completion form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldsList
                  fields={filteredFields}
                  isLoading={isLoading}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteField}
                  onToggleActive={handleToggleActive}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Custom Fields</CardTitle>
                <CardDescription>
                  These fields will appear in the program application form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldsList
                  fields={filteredFields}
                  isLoading={isLoading}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteField}
                  onToggleActive={handleToggleActive}
                  programs={programs}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface FieldsListProps {
  fields: CustomFormField[];
  isLoading: boolean;
  onEdit: (field: CustomFormField) => void;
  onDelete: (id: string) => void;
  onToggleActive: (field: CustomFormField) => void;
  programs?: any[];
}

function FieldsList({ fields, isLoading, onEdit, onDelete, onToggleActive, programs }: FieldsListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading fields...</div>;
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No custom fields defined yet. Click "Add Field" to create one.
      </div>
    );
  }

  const getFieldTypeLabel = (type: string) => {
    return FIELD_TYPES.find(t => t.value === type)?.label || type;
  };

  const getProgramName = (programId: string | null) => {
    if (!programId) return 'All Programs';
    return programs?.find(p => p.id === programId)?.title || 'Unknown Program';
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div
          key={field.id}
          className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
            field.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
          }`}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{field.field_label}</span>
              {field.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              {!field.is_active && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Badge variant="outline">{getFieldTypeLabel(field.field_type)}</Badge>
              {field.program_id && (
                <Badge variant="secondary">{getProgramName(field.program_id)}</Badge>
              )}
              <span className="text-xs">({field.field_name})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={field.is_active}
              onCheckedChange={() => onToggleActive(field)}
            />
            <Button variant="ghost" size="icon" onClick={() => onEdit(field)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(field.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
