import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { 
  BookOpen, 
  Loader2, 
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  CreditCard,
  Search,
  MoreVertical,
  Calendar,
  ChevronDown,
  ChevronUp,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface Program {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  application_fee: number;
  registration_fee: number;
  status: string;
  max_capacity: number | null;
  enrolled_count: number;
  created_at: string;
}

interface Batch {
  id: string;
  program_id: string;
  batch_name: string;
  start_date: string;
  end_date: string | null;
  max_capacity: number | null;
  enrolled_count: number;
  status: string;
}

const defaultProgram = {
  title: "",
  description: "",
  duration: "",
  application_fee: 0,
  registration_fee: 0,
  status: "draft",
  max_capacity: null as number | null,
};

const defaultBatch = {
  batch_name: "",
  start_date: "",
  end_date: "",
  max_capacity: "",
  status: "open",
};

const AdminPrograms = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [formData, setFormData] = useState(defaultProgram);
  
  // Batch management state
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchFormData, setBatchFormData] = useState(defaultBatch);
  const [selectedProgramForBatch, setSelectedProgramForBatch] = useState<string | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch all batches
  const { data: allBatches } = useQuery({
    queryKey: ['admin-all-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Batch[];
    },
  });

  // Helper to get batches for a program
  const getBatchesForProgram = (programId: string) => {
    return allBatches?.filter(b => b.program_id === programId) || [];
  };

  const createProgramMutation = useMutation({
    mutationFn: async (data: typeof defaultProgram) => {
      const { error } = await supabase
        .from("programs")
        .insert([{
          title: data.title,
          description: data.description || null,
          duration: data.duration,
          application_fee: data.application_fee,
          registration_fee: data.registration_fee,
          status: data.status as 'draft' | 'published' | 'archived',
          max_capacity: data.max_capacity || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success("Program created successfully");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Failed to create program");
      logger.error(error);
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof defaultProgram }) => {
      const { error } = await supabase
        .from("programs")
        .update({
          title: data.title,
          description: data.description || null,
          duration: data.duration,
          application_fee: data.application_fee,
          registration_fee: data.registration_fee,
          status: data.status as 'draft' | 'published' | 'archived',
          max_capacity: data.max_capacity || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success("Program updated successfully");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Failed to update program");
      logger.error(error);
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success("Program deleted successfully");
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete program. It may have associated applications.");
      logger.error(error);
    },
  });

  // Batch mutations
  const createBatchMutation = useMutation({
    mutationFn: async (data: { programId: string; batch: typeof defaultBatch }) => {
      const { error } = await supabase
        .from("batches")
        .insert({
          program_id: data.programId,
          batch_name: data.batch.batch_name,
          start_date: data.batch.start_date,
          end_date: data.batch.end_date || null,
          max_capacity: data.batch.max_capacity ? parseInt(data.batch.max_capacity) : null,
          status: data.batch.status,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-batches'] });
      toast.success("Cohort created successfully");
      closeBatchDialog();
    },
    onError: (error) => {
      toast.error("Failed to create cohort");
      logger.error(error);
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof defaultBatch }) => {
      const { error } = await supabase
        .from("batches")
        .update({
          batch_name: data.batch_name,
          start_date: data.start_date,
          end_date: data.end_date || null,
          max_capacity: data.max_capacity ? parseInt(data.max_capacity) : null,
          status: data.status,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-batches'] });
      toast.success("Cohort updated successfully");
      closeBatchDialog();
    },
    onError: (error) => {
      toast.error("Failed to update cohort");
      logger.error(error);
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-batches'] });
      toast.success("Cohort deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete cohort. It may have associated applications.");
      logger.error(error);
    },
  });

  const openCreateDialog = () => {
    setEditingProgram(null);
    setFormData(defaultProgram);
    setIsDialogOpen(true);
  };

  const openEditDialog = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || "",
      duration: program.duration,
      application_fee: program.application_fee,
      registration_fee: program.registration_fee,
      status: program.status,
      max_capacity: program.max_capacity,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProgram(null);
    setFormData(defaultProgram);
  };

  // Batch dialog handlers
  const openCreateBatchDialog = (programId: string) => {
    setSelectedProgramForBatch(programId);
    setEditingBatch(null);
    setBatchFormData(defaultBatch);
    setIsBatchDialogOpen(true);
  };

  const openEditBatchDialog = (batch: Batch) => {
    setSelectedProgramForBatch(batch.program_id);
    setEditingBatch(batch);
    setBatchFormData({
      batch_name: batch.batch_name,
      start_date: batch.start_date,
      end_date: batch.end_date || "",
      max_capacity: batch.max_capacity?.toString() || "",
      status: batch.status,
    });
    setIsBatchDialogOpen(true);
  };

  const closeBatchDialog = () => {
    setIsBatchDialogOpen(false);
    setEditingBatch(null);
    setSelectedProgramForBatch(null);
    setBatchFormData(defaultBatch);
  };

  const handleBatchSubmit = () => {
    if (!batchFormData.batch_name || !batchFormData.start_date || !selectedProgramForBatch) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingBatch) {
      updateBatchMutation.mutate({ id: editingBatch.id, data: batchFormData });
    } else {
      createBatchMutation.mutate({ programId: selectedProgramForBatch, batch: batchFormData });
    }
  };

  const toggleProgramExpanded = (programId: string) => {
    setExpandedPrograms(prev => {
      const next = new Set(prev);
      if (next.has(programId)) {
        next.delete(programId);
      } else {
        next.add(programId);
      }
      return next;
    });
  };

  const getBatchStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="approved">Open</Badge>;
      case 'closed': return <Badge variant="rejected">Closed</Badge>;
      case 'upcoming': return <Badge variant="pending">Upcoming</Badge>;
      case 'ongoing': return <Badge variant="active">Ongoing</Badge>;
      case 'completed': return <Badge variant="default">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.duration) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingProgram) {
      updateProgramMutation.mutate({ id: editingProgram.id, data: formData });
    } else {
      createProgramMutation.mutate(formData);
    }
  };

  const confirmDelete = (program: Program) => {
    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const filteredPrograms = programs?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="approved">Published</Badge>;
      case 'draft': return <Badge variant="pending">Draft</Badge>;
      case 'archived': return <Badge variant="rejected">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const dashboardRole = role === 'super_admin' ? 'super-admin' : (role as 'admin' | 'instructor');

  if (isLoading) {
    return (
      <DashboardLayout role={dashboardRole} title="Programs">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole}
      title="Program Management" 
      subtitle="Create and manage training programs"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{programs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Programs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {programs?.reduce((sum, p) => sum + (p.enrolled_count || 0), 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {programs?.filter(p => p.status === 'published').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List with Cohorts */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Programs</CardTitle>
            <CardDescription>Manage programs and their cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            {!filteredPrograms || filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first training program to get started.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrograms.map((program) => {
                  const programBatches = getBatchesForProgram(program.id);
                  const isExpanded = expandedPrograms.has(program.id);

                  return (
                    <Collapsible 
                      key={program.id} 
                      open={isExpanded}
                      onOpenChange={() => toggleProgramExpanded(program.id)}
                    >
                      <Card className="border">
                        <CardContent className="p-0">
                          {/* Program Row */}
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 flex-1">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{program.title}</p>
                                  {getStatusBadge(program.status)}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {program.description || "No description"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-sm text-center">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>{program.duration}</span>
                                </div>
                              </div>
                              <div className="text-sm text-center">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>{program.enrolled_count}{program.max_capacity && `/${program.max_capacity}`}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <Badge variant="outline" className="font-normal">
                                  <CalendarDays className="w-3 h-3 mr-1" />
                                  {programBatches.length} cohorts
                                </Badge>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(program)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Program
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openCreateBatchDialog(program.id)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Cohort
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => confirmDelete(program)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Program
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Cohorts Section */}
                          <CollapsibleContent>
                            <div className="border-t bg-muted/30 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4 text-accent" />
                                  Cohorts
                                </h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openCreateBatchDialog(program.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Cohort
                                </Button>
                              </div>

                              {programBatches.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No cohorts created yet</p>
                                  <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => openCreateBatchDialog(program.id)}
                                  >
                                    Create your first cohort
                                  </Button>
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Cohort Name</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {programBatches.map((batch) => (
                                        <TableRow key={batch.id}>
                                          <TableCell className="font-medium">{batch.batch_name}</TableCell>
                                          <TableCell>{format(new Date(batch.start_date), 'MMM dd, yyyy')}</TableCell>
                                          <TableCell>
                                            {batch.end_date ? format(new Date(batch.end_date), 'MMM dd, yyyy') : '-'}
                                          </TableCell>
                                          <TableCell>
                                            {batch.enrolled_count || 0}/{batch.max_capacity || '∞'}
                                          </TableCell>
                                          <TableCell>{getBatchStatusBadge(batch.status)}</TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                              <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => openEditBatchDialog(batch)}
                                              >
                                                <Edit className="w-4 h-4" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => deleteBatchMutation.mutate(batch.id)}
                                                className="text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Edit Program" : "Create New Program"}</DialogTitle>
            <DialogDescription>
              {editingProgram ? "Update program details" : "Add a new training program"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Full Stack Development"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Program description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 12 weeks"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="application_fee">Application Fee (₦)</Label>
                <Input
                  id="application_fee"
                  type="number"
                  value={formData.application_fee}
                  onChange={(e) => setFormData({ ...formData, application_fee: Number(e.target.value) })}
                  placeholder="5000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="registration_fee">Registration Fee (₦)</Label>
                <Input
                  id="registration_fee"
                  type="number"
                  value={formData.registration_fee}
                  onChange={(e) => setFormData({ ...formData, registration_fee: Number(e.target.value) })}
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_capacity">Max Capacity (optional)</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={formData.max_capacity || ""}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
            >
              {(createProgramMutation.isPending || updateProgramMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingProgram ? "Update Program" : "Create Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{programToDelete?.title}"? This action cannot be undone.
              Programs with existing applications cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => programToDelete && deleteProgramMutation.mutate(programToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProgramMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Cohort Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBatch ? "Edit Cohort" : "Create New Cohort"}</DialogTitle>
            <DialogDescription>
              {editingBatch ? "Update cohort details" : "Add a new cohort for students to enroll in"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="batch_name">Cohort Name *</Label>
              <Input
                id="batch_name"
                value={batchFormData.batch_name}
                onChange={(e) => setBatchFormData({ ...batchFormData, batch_name: e.target.value })}
                placeholder="e.g., January 2026 Cohort"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={batchFormData.start_date}
                  onChange={(e) => setBatchFormData({ ...batchFormData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={batchFormData.end_date}
                  onChange={(e) => setBatchFormData({ ...batchFormData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch_max_capacity">Max Capacity</Label>
                <Input
                  id="batch_max_capacity"
                  type="number"
                  value={batchFormData.max_capacity}
                  onChange={(e) => setBatchFormData({ ...batchFormData, max_capacity: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch_status">Status</Label>
                <Select 
                  value={batchFormData.status} 
                  onValueChange={(value) => setBatchFormData({ ...batchFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeBatchDialog}>Cancel</Button>
            <Button 
              onClick={handleBatchSubmit}
              disabled={createBatchMutation.isPending || updateBatchMutation.isPending}
            >
              {(createBatchMutation.isPending || updateBatchMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingBatch ? "Update Cohort" : "Create Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPrograms;
