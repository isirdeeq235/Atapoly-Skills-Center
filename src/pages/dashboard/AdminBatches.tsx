import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import { usePrograms } from "@/hooks/usePrograms";
import { 
  Plus, 
  Loader2, 
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";

interface Batch {
  id: string;
  program_id: string;
  batch_name: string;
  start_date: string;
  end_date: string | null;
  max_capacity: number | null;
  enrolled_count: number;
  status: string;
  created_at: string;
  program?: {
    title: string;
  };
}

const AdminBatches = () => {
  const queryClient = useQueryClient();
  const { data: programs } = usePrograms();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    program_id: "",
    batch_name: "",
    start_date: "",
    end_date: "",
    max_capacity: "",
    status: "upcoming",
  });

  const { data: batches, isLoading } = useQuery({
    queryKey: ['admin-batches'],
    queryFn: async () => {
      const data = await apiFetch('/api/batches');
      return data as Batch[];
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiFetch('/api/batches', { method: 'POST', body: JSON.stringify({
        program_id: data.program_id,
        batch_name: data.batch_name,
        start_date: data.start_date,
        end_date: data.end_date || null,
        max_capacity: data.max_capacity ? parseInt(data.max_capacity) : null,
        status: data.status,
      }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Batch created successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to create batch: " + (error.message || String(error)));
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      await apiFetch(`/api/batches/${id}`, { method: 'PUT', body: JSON.stringify({
        program_id: data.program_id,
        batch_name: data.batch_name,
        start_date: data.start_date,
        end_date: data.end_date || null,
        max_capacity: data.max_capacity ? parseInt(data.max_capacity) : null,
        status: data.status,
      }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
      setIsDialogOpen(false);
      setEditingBatch(null);
      resetForm();
      toast.success("Batch updated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to update batch: " + (error.message || String(error)));
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/batches/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] });
      toast.success("Batch deleted successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to delete batch: " + (error.message || String(error)));
    },
  });

  const resetForm = () => {
    setFormData({
      program_id: "",
      batch_name: "",
      start_date: "",
      end_date: "",
      max_capacity: "",
      status: "upcoming",
    });
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      program_id: batch.program_id,
      batch_name: batch.batch_name,
      start_date: batch.start_date,
      end_date: batch.end_date || "",
      max_capacity: batch.max_capacity?.toString() || "",
      status: batch.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBatch) {
      updateBatchMutation.mutate({ id: editingBatch.id, data: formData });
    } else {
      createBatchMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="pending">Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="active">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="approved">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="rejected">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin" title="Batch Management" subtitle="Manage program batches and cohorts">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Batch Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage program batches and cohorts
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingBatch(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
                <DialogDescription>
                  {editingBatch ? 'Update batch details' : 'Add a new batch for a program'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input
                    placeholder="e.g., January 2026 Cohort"
                    value={formData.batch_name}
                    onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Capacity</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBatchMutation.isPending || updateBatchMutation.isPending}>
                    {(createBatchMutation.isPending || updateBatchMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingBatch ? 'Update' : 'Create'} Batch
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Batches", value: batches?.length || 0, icon: Calendar },
            { label: "Ongoing", value: batches?.filter(b => b.status === 'ongoing').length || 0, icon: Users },
            { label: "Upcoming", value: batches?.filter(b => b.status === 'upcoming').length || 0, icon: Calendar },
            { label: "Completed", value: batches?.filter(b => b.status === 'completed').length || 0, icon: Calendar },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : batches && batches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_name}</TableCell>
                      <TableCell>{programs?.find(p => p.id === batch.program_id)?.title}</TableCell>
                      <TableCell>{batch.start_date ? format(new Date(batch.start_date), 'MMM dd, yyyy') : '-'}</TableCell>
                      <TableCell>
                        {batch.end_date ? format(new Date(batch.end_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {0}/{batch.max_capacity || '∞'}
                      </TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(batch)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteBatchMutation.mutate(batch.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No batches created yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminBatches;
