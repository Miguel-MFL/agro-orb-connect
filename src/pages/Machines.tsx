import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tractor, Search, ArrowLeft } from "lucide-react";
import MachineCard, { Machine } from "@/components/MachineCard";
import AddMachineDialog from "@/components/AddMachineDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MACHINE_TYPES = [
  "Trator Agrícola Compacto",
  "Plantadeira Autotransportável",
  "Pulverizador de Arrasto",
  "Pulverizador Montado (de Barra)",
  "Distribuidor de Fertilizantes de Arrasto",
  "Semeadeira de Precisão Dobrável",
  "Arado de Aiveca",
  "Grade Niveladora Leve",
  "Carreta Agrícola (Reboque)",
  "Roçadeira Rotativa",
  "Subsolador (Implemento)",
  "Enfardadora de Feno Compacta",
  "Plaina Agrícola (Lâmina Niveladora)",
  "Colhedora de Pequenas Culturas",
  "Perfurador de Solo (Implemento)"
];

const Machines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchType, setSearchType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const machines: Machine[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        year: item.year,
        usageTime: item.usage_time,
        location: item.location,
        contact: item.contact,
        image: item.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
      }));

      setMachines(machines);
    } catch (error: any) {
      toast.error("Erro ao carregar máquinas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async (newMachine: Omit<Machine, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para cadastrar uma máquina");
        return;
      }

      const { data, error } = await supabase
        .from("machines")
        .insert([
          {
            name: newMachine.name,
            type: newMachine.type,
            year: newMachine.year,
            usage_time: newMachine.usageTime,
            location: newMachine.location,
            contact: newMachine.contact,
            image: newMachine.image,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const machine: Machine = {
          id: data.id,
          name: data.name,
          type: data.type,
          year: data.year,
          usageTime: data.usage_time,
          location: data.location,
          contact: data.contact,
          image: data.image
        };
        setMachines([machine, ...machines]);
        toast.success("Máquina cadastrada com sucesso!");
      }
    } catch (error: any) {
      toast.error("Erro ao cadastrar máquina");
      console.error(error);
    }
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesType = searchType === "all" || machine.type === searchType;
    const matchesQuery = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        machine.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tractor className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Orna - Aluguel de Máquinas</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou localização..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full md:w-80 border-primary/30">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {MACHINE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddMachineDialog onAddMachine={handleAddMachine} machineTypes={MACHINE_TYPES} />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando máquinas...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Tractor className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Não há máquinas disponíveis no momento
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar os filtros ou cadastre uma nova máquina
            </p>
            <AddMachineDialog onAddMachine={handleAddMachine} machineTypes={MACHINE_TYPES} />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Encontradas <span className="font-bold text-primary">{filteredMachines.length}</span> máquina(s)
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Machines;
