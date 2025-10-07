import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Machine } from "./MachineCard";

interface AddMachineDialogProps {
  onAddMachine: (machine: Omit<Machine, "id">) => void;
  machineTypes: string[];
}

const AddMachineDialog = ({ onAddMachine, machineTypes }: AddMachineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    year: "",
    usageTime: "",
    location: "",
    contact: "",
    image: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.year || !formData.usageTime || !formData.location || !formData.contact) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    onAddMachine({
      name: formData.name,
      type: formData.type,
      year: parseInt(formData.year),
      usageTime: formData.usageTime,
      location: formData.location,
      contact: formData.contact,
      image: formData.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
    });

    toast.success("Máquina cadastrada com sucesso!");
    setFormData({
      name: "",
      type: "",
      year: "",
      usageTime: "",
      location: "",
      contact: "",
      image: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="lg" className="shadow-medium">
          <Plus className="w-5 h-5 mr-2" />
          Cadastrar Máquina
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Cadastrar Nova Máquina</DialogTitle>
          <DialogDescription>
            Preencha os dados da sua máquina agrícola para disponibilizar para aluguel
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Máquina *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Trator John Deere 6110J"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Máquina *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano de Fabricação *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2020"
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageTime">Tempo de Uso *</Label>
              <Input
                id="usageTime"
                value={formData.usageTime}
                onChange={(e) => setFormData({ ...formData, usageTime: e.target.value })}
                placeholder="500 horas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: São Paulo, SP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL da Imagem (opcional)</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full" variant="default">
            Cadastrar Máquina
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMachineDialog;
