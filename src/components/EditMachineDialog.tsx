import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Machine } from "@/components/MachineCard";
import { machinesService } from "@/lib/machinesService";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

interface EditMachineDialogProps {
  machine: Machine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditMachine: (machine: Machine) => void;
}

const EditMachineDialog = ({ machine, open, onOpenChange, onEditMachine }: EditMachineDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: machine.name,
    type: machine.type,
    year: machine.year,
    usage_time: machine.usage_time,
    location: machine.location,
    contact: machine.contact,
    hourly_price: machine.hourly_price || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.year || !formData.usage_time || !formData.location || !formData.contact || !formData.hourly_price) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const updatedMachine = await machinesService.updateMachine(machine.id, formData);
      onEditMachine(updatedMachine);
      toast.success("Máquina atualizada com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao atualizar máquina: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Máquina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome/Modelo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Trator John Deere 6110J"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Ex: Trator, Colheitadeira, Plantadeira"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                placeholder="2020"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_time">Tempo de Uso *</Label>
              <Input
                id="usage_time"
                value={formData.usage_time}
                onChange={(e) => setFormData({ ...formData, usage_time: e.target.value })}
                placeholder="Ex: 500 horas"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: São Paulo - SP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Ex: (11) 98765-4321"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_price">Preço por Hora (R$) *</Label>
            <Input
              id="hourly_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_price}
              onChange={(e) => setFormData({ ...formData, hourly_price: parseFloat(e.target.value) })}
              placeholder="Ex: 150.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMachineDialog;
