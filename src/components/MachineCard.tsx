import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";

export interface Machine {
  id: string;
  name: string;
  type: string;
  year: number;
  usageTime: string;
  location: string;
  contact: string;
  image: string;
}

interface MachineCardProps {
  machine: Machine;
}

const MachineCard = ({ machine }: MachineCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40 animate-fade-in">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img 
          src={machine.image} 
          alt={machine.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
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
            <span>Uso: <span className="font-semibold text-foreground">{machine.usageTime}</span></span>
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
