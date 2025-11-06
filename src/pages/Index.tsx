import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Fuel, Clock, DollarSign, MapPin, Leaf, ShieldCheck, BrainCircuit } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Fuel,
      title: "Redução no Consumo de Combustível",
      description: "Planejamento de rotas mais curtas e eficientes reduz significativamente o gasto com diesel ou biodiesel, impactando diretamente os custos operacionais.",
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Rotas otimizadas minimizam o tempo de manobra e evitam sobreposições desnecessárias, permitindo cobrir mais área em menos tempo.",
    },
    {
      icon: DollarSign,
      title: "Menor Custo Operacional",
      description: "A diminuição no uso de combustível e no tempo de operação se traduz em economia financeira direta para o produtor.",
    },
    {
      icon: MapPin,
      title: "Maximização da Área Trabalhada",
      description: "Um planejamento correto evita áreas esquecidas ou trabalhadas mais de uma vez, garantindo cobertura total eficiente.",
    },
    {
      icon: Tractor,
      title: "Controle da Compactação do Solo",
      description: "Sistemas avançados (como o Tráfego Controlado) planejam rotas para minimizar o número de passagens sobre o mesmo ponto do solo, evitando a compactação excessiva, o que é crucial para o desenvolvimento saudável das raízes e o rendimento da cultura.",
    },
    {
      icon: BrainCircuit,
      title: "Aplicação Precisa de Insumos",
      description: "As rotas otimizadas garantem que a aplicação de defensivos, fertilizantes ou sementes seja feita de forma mais uniforme e precisa, evitando sobreposições (desperdício) ou falhas de cobertura.",
    },
    {
      icon: ShieldCheck,
      title: "Segurança Operacional",
      description: "Em operações noturnas ou em terrenos irregulares, as rotas pré-planejadas com o auxílio de GPS/GNSS orientam o operador, reduzindo o risco de acidentes ou desvios perigosos.",
    },
    {
      icon: Leaf,
      title: "Sustentabilidade Ambiental",
      description: "A otimização do uso de combustível (menor emissão de CO2) e a aplicação mais precisa de insumos (evitando excessos) contribuem para uma agricultura mais sustentável e ambientalmente responsável.",
    },
    {
      icon: BrainCircuit,
      title: "Redução da Fadiga do Operador",
      description: "Ao automatizar a direção e fornecer rotas claras (piloto automático e barra de luzes), o sistema diminui a carga mental do operador, permitindo que ele se concentre na qualidade da aplicação e na segurança.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/20 to-background py-20 px-6">
        <div className="container mx-auto text-center">
          <Tractor className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sistema de Otimização de Rotas
            <br />
            <span className="text-primary">Máquinas Agrícolas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Maximize a eficiência, reduza custos e aumente a produtividade com rotas inteligentes para suas operações agrícolas
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/route-optimization")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Acessar Simulador de Rotas
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Por que usar Otimização de Rotas?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Descubra os principais benefícios que um sistema de rotas otimizadas pode trazer para sua operação agrícola
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="w-10 h-10 mb-4 text-primary" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para otimizar suas rotas?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experimente nosso simulador e veja na prática como a otimização de rotas pode transformar sua operação agrícola
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/route-optimization")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Começar Agora
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
