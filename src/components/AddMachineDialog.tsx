import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Machine } from "./MachineCard";
import { machinesService } from "@/lib/machinesService";

interface AddMachineDialogProps {
  onAddMachine: (machine: Machine) => void;
  currentUserId: string;
}

const AddMachineDialog = ({ onAddMachine, currentUserId }: AddMachineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    year: "",
    usage_time: "",
    location: "",
    contact: "",
    images: [] as string[]
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.name || !formData.model || !formData.year || !formData.usage_time || !formData.location || !formData.contact) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const newMachine = await machinesService.addMachine({
        name: formData.name,
        type: formData.model,
        year: parseInt(formData.year),
        usage_time: formData.usage_time,
        location: formData.location,
        contact: formData.contact,
        images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"],
        user_id: currentUserId
      });

      onAddMachine(newMachine);
      toast.success("Máquina cadastrada com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        model: "",
        year: "",
        usage_time: "",
        location: "",
        contact: "",
        images: []
      });
      setImagePreviews([]);
      setOpen(false);
    } catch (error: any) {
      toast.error("Erro ao cadastrar máquina: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (files: FileList) => {
    const maxImages = 5;
    const currentImagesCount = formData.images.length;
    const remainingSlots = maxImages - currentImagesCount;
    
    if (remainingSlots <= 0) {
      toast.error(`Você pode adicionar no máximo ${maxImages} fotos`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result]
        }));
        setImagePreviews(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    
    if (files.length > remainingSlots) {
      toast.info(`Apenas ${remainingSlots} foto(s) foi(foram) adicionada(s). Limite: ${maxImages} fotos`);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
            <Label htmlFor="name">Nome do Proprietário *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo da Máquina *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ex: John Deere 6110J"
              required
            />
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
            <Label htmlFor="images">Fotos da Máquina (até 5)</Label>
            <div className="space-y-3">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleImageUpload(files);
                  }
                }}
                className="cursor-pointer"
                disabled={formData.images.length >= 5}
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-full h-32 rounded-md overflow-hidden border border-border group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.images.length}/5 fotos adicionadas
              </p>
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
