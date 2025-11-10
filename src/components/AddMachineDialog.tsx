import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Machine } from "./MachineCard";
import { machinesService } from "@/lib/machinesService";

interface AddMachineDialogProps {
  onAddMachine: (machine: Machine) => void;
  machineTypes: string[];
  currentUserId: string;
}

const AddMachineDialog = ({ onAddMachine, machineTypes, currentUserId }: AddMachineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    year: "",
    usage_time: "",
    location: "",
    contact: "",
    image: ""
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.name || !formData.type || !formData.year || !formData.usage_time || !formData.location || !formData.contact) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const newMachine = await machinesService.addMachine({
        name: formData.name,
        type: formData.type,
        year: parseInt(formData.year),
        usage_time: formData.usage_time,
        location: formData.location,
        contact: formData.contact,
        image: formData.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        user_id: currentUserId
      });

      onAddMachine(newMachine);
      toast.success("Máquina cadastrada com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        year: "",
        usage_time: "",
        location: "",
        contact: "",
        image: ""
      });
      setImagePreview("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Erro ao cadastrar máquina: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    // Por enquanto vamos usar URLs estáticas
    // Em produção, você pode implementar upload para o Supabase Storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFormData({ ...formData, image: result });
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
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
              required
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_time">Tempo de Uso *</Label>
              <Input
                id="usage_time"
                value={formData.usage_time}
                onChange={(e) => setFormData({ ...formData, usage_time: e.target.value })}
                placeholder="500 horas"
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
              placeholder="Ex: São Paulo, SP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Foto da Máquina</Label>
            <div className="space-y-3">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-full h-40 rounded-md overflow-hidden border border-border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            variant="default"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar Máquina"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMachineDialog;
