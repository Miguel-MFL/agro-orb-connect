import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tractor, Search, ArrowLeft, RefreshCw } from "lucide-react";
import MachineCard, { Machine } from "@/components/MachineCard";
import AddMachineDialog from "@/components/AddMachineDialog";
import { machinesService } from "@/lib/machinesService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadMachines();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const loadMachines = async () => {
    setLoading(true);
    try {
      const machinesData = await machinesService.getMachines();
      setMachines(machinesData);
    } catch (error: any) {
      toast.error("Erro ao carregar máquinas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = (newMachine: Machine) => {
    setMachines([newMachine, ...machines]);
  };

  const handleDeleteMachine = async (machineId: string) => {
    try {
      await machinesService.deleteMachine(machineId);
      setMachines(machines.filter(m => m.id !== machineId));
      toast.success("Máquina excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir máquina: " + error.message);
    }
  };

  const filteredMachines = machines.filter((machine) => {
    const matchesType = searchType === "all" || machine.type === searchType;
    const matchesQuery = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        machine.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <h1 className="text-2xl font-bold">Orma - Aluguel de Máquinas</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={loadMachines}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
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
            {currentUser && (
              <AddMachineDialog 
                onAddMachine={handleAddMachine} 
                currentUserId={currentUser.id}
              />
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando máquinas...</p>
          </div>
        )}

        {/* Results */}
        {!loading && filteredMachines.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Tractor className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {machines.length === 0 ? "Não há máquinas disponíveis" : "Nenhuma máquina encontrada"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {machines.length === 0 
                ? "Cadastre uma nova máquina para começar" 
                : "Tente ajustar os filtros de busca"}
            </p>
            {currentUser && (
              <AddMachineDialog 
                onAddMachine={handleAddMachine} 
                currentUserId={currentUser.id}
              />
            )}
          </div>
        ) : (
          !loading && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Encontradas <span className="font-bold text-primary">{filteredMachines.length}</span> máquina(s)
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMachines.map((machine) => (
                  <MachineCard 
                    key={machine.id} 
                    machine={machine}
                    currentUserId={currentUser?.id}
                    onDelete={handleDeleteMachine}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Machines;
