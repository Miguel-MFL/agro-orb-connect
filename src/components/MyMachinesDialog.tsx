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
import { Package, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

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

  const handlePrevImage = (machineId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [machineId]: ((prev[machineId] || 0) === 0 ? totalImages - 1 : (prev[machineId] || 0) - 1)
    }));
  };

  const handleNextImage = (machineId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [machineId]: ((prev[machineId] || 0) === totalImages - 1 ? 0 : (prev[machineId] || 0) + 1)
    }));
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
              {userMachines.map((machine) => {
                const images = machine.images && machine.images.length > 0 
                  ? machine.images 
                  : ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"];
                const currentIndex = imageIndexes[machine.id] || 0;
                
                return (
                  <div 
                    key={machine.id}
                    className="border border-border rounded-lg overflow-hidden hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {/* Image Section */}
                      <div className="relative w-full md:w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted group">
                        <img 
                          src={images[currentIndex]} 
                          alt={`${machine.name} - Foto ${currentIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {images.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-strong"
                              onClick={() => handlePrevImage(machine.id, images.length)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-strong"
                              onClick={() => handleNextImage(machine.id, images.length)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {images.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex ? 'bg-primary w-4' : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 flex justify-between items-start gap-4">
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
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
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
                  </div>
                );
              })}
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
