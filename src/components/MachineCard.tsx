import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export interface Machine {
  id: string;
  name: string;
  type: string;
  year: number;
  usage_time: string;
  location: string;
  contact: string;
  images: string[];
  user_id: string;
  created_at?: string;
  hourly_price?: number;
}

interface MachineCardProps {
  machine: Machine;
  currentUserId?: string;
  onDelete?: (machineId: string) => void;
}

const MachineCard = ({ machine, currentUserId, onDelete }: MachineCardProps) => {
  const isOwner = currentUserId && machine.user_id && currentUserId === machine.user_id;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = machine.images && machine.images.length > 0 
    ? machine.images 
    : ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40 animate-fade-in">
      <div className="aspect-video bg-muted relative overflow-hidden group">
        <img 
          src={images[currentImageIndex]} 
          alt={`${machine.name} - Foto ${currentImageIndex + 1}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-strong"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-strong"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="pt-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground mb-1">{machine.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{machine.type}</Badge>
            {machine.hourly_price && (
              <Badge variant="default" className="text-xs font-semibold">
                R$ {machine.hourly_price.toFixed(2)}/hora
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Ano: <span className="font-semibold text-foreground">{machine.year}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Horas de uso: <span className="font-semibold text-foreground">{machine.usage_time}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{machine.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Contato: <span className="font-semibold text-foreground">{machine.contact}</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default MachineCard;
