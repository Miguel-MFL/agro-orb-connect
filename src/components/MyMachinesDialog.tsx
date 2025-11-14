import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Machine } from "@/components/MachineCard";
import { machinesService } from "@/lib/machinesService";
import { toast } from "sonner";
import { Package, Pencil, Trash2, Loader2 } from "lucide-react";
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
import EditMachineDialog from "./EditMachineDialog";

interface MyMachinesDialogProps {
  currentUserId: string;
  onDeleteMachine: (machineId: string) => void;
  onUpdateMachine: (machine: Machine) => void;
}

const MyMachinesDialog = ({ currentUserId, onDeleteMachine, onUpdateMachine }: MyMachinesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [userMachines, setUserMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<string | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  useEffect(() => {
    if (open) {
      loadUserMachines();
    }
  }, [open]);

  const loadUserMachines = async () => {
    setLoading(true);
    try {
      const machines = await machinesService.getUserMachines(currentUserId);
      setUserMachines(machines);
    } catch (error: any) {
      toast.error("Erro ao carregar suas máquinas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!machineToDelete) return;
    
    try {
      await machinesService.deleteMachine(machineToDelete);
      setUserMachines(userMachines.filter(m => m.id !== machineToDelete));
      onDeleteMachine(machineToDelete);
      toast.success("Máquina excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir máquina: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setMachineToDelete(null);
    }
  };

  const handleEdit = (updatedMachine: Machine) => {
    setUserMachines(userMachines.map(m => m.id === updatedMachine.id ? updatedMachine : m));
    onUpdateMachine(updatedMachine);
    setEditingMachine(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Package className="w-4 h-4 mr-2" />
            Minhas Máquinas
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minhas Máquinas Cadastradas</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : userMachines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não cadastrou nenhuma máquina.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userMachines.map((machine) => (
                <div 
                  key={machine.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{machine.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <p><span className="font-medium">Tipo:</span> {machine.type}</p>
                        <p><span className="font-medium">Ano:</span> {machine.year}</p>
                        <p><span className="font-medium">Horas de uso:</span> {machine.usage_time}</p>
                        <p><span className="font-medium">Localização:</span> {machine.location}</p>
                        <p><span className="font-medium">Contato:</span> {machine.contact}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMachine(machine)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMachineToDelete(machine.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingMachine && (
        <EditMachineDialog
          machine={editingMachine}
          open={!!editingMachine}
          onOpenChange={(open) => !open && setEditingMachine(null)}
          onEditMachine={handleEdit}
        />
      )}
    </>
  );
};

export default MyMachinesDialog;
