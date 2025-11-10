import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface Machine {
  id: string;
  name: string;
  type: string;
  year: number;
  usage_time: string; // Mudei para snake_case para bater com o banco
  location: string;
  contact: string;
  image: string;
  user_id: string;
  created_at?: string;
}

interface MachineCardProps {
  machine: Machine;
  currentUserId?: string;
  onDelete?: (machineId: string) => void;
}

const MachineCard = ({ machine, currentUserId, onDelete }: MachineCardProps) => {
  const isOwner = currentUserId && machine.userId && currentUserId === machine.userId;

  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40 animate-fade-in">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img 
          src={machine.image} 
          alt={machine.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {isOwner && onDelete && (
          <div className="absolute top-2 right-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="shadow-strong"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir máquina?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir "{machine.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(machine.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <CardContent className="pt-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground mb-1">{machine.name}</h3>
          <Badge variant="secondary" className="text-xs">{machine.type}</Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Ano: <span className="font-semibold text-foreground">{machine.year}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Uso: <span className="font-semibold text-foreground">{machine.usage_time}</span></span>
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
