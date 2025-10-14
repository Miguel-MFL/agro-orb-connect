import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tractor, ArrowLeft, Route, MapPin, Clock, Fuel } from "lucide-react";

const RouteOptimization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    vehicleType: "",
    priority: "time"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para calcular rota otimizada
    console.log("Dados do formulário:", formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Route className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Orna - Otimização de Rotas</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-6 h-6" />
                  Configurar Rota
                </CardTitle>
                <CardDescription>
                  Informe os detalhes para otimizar sua rota agrícola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origem</Label>
                    <Input
                      id="origin"
                      placeholder="Local de partida"
                      value={formData.origin}
                      onChange={(e) => handleInputChange("origin", e.target.value)}
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      placeholder="Local de destino"
                      value={formData.destination}
                      onChange={(e) => handleInputChange("destination", e.target.value)}
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                      <SelectTrigger className="border-primary/30">
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tractor">Trator Agrícola</SelectItem>
                        <SelectItem value="harvester">Colheitadeira</SelectItem>
                        <SelectItem value="sprayer">Pulverizador</SelectItem>
                        <SelectItem value="truck">Caminhão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade de Otimização</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger className="border-primary/30">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Menor Tempo</SelectItem>
                        <SelectItem value="distance">Menor Distância</SelectItem>
                        <SelectItem value="fuel">Economia de Combustível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Route className="w-4 h-4 mr-2" />
                    Calcular Rota Otimizada
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle>Rota Otimizada</CardTitle>
                <CardDescription>
                  Visualize a melhor rota calculada para seu trajeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder para o mapa */}
                <div className="bg-muted/30 rounded-lg h-96 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Mapa da rota otimizada será exibido aqui</p>
                  </div>
                </div>

                {/* Estatísticas da Rota */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                          <p className="text-xl font-bold text-foreground">2h 15min</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Route className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Distância</p>
                          <p className="text-xl font-bold text-foreground">85 km</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Fuel className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Combustível</p>
                          <p className="text-xl font-bold text-foreground">42 L</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Instruções da Rota */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Instruções do Trajeto</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                        1
                      </div>
                      <p>Sair do ponto de origem e seguir pela estrada principal</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                        2
                      </div>
                      <p>Virar à direita na PR-445 após 25km</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                        3
                      </div>
                      <p>Seguir por 60km até o destino final</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;