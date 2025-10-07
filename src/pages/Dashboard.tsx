import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tractor, Route, CheckCircle, TrendingUp, Zap, Users } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const Dashboard = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Route,
      title: "Otimização de Rotas",
      description: "Reduza até 40% o tempo de deslocamento entre talhões"
    },
    {
      icon: Zap,
      title: "Economia de Combustível",
      description: "Economize até 30% em combustível com rotas inteligentes"
    },
    {
      icon: TrendingUp,
      title: "Aumento de Produtividade",
      description: "Maximize o uso de suas máquinas e aumente a eficiência"
    },
    {
      icon: Users,
      title: "Gestão de Frota",
      description: "Controle total sobre disponibilidade e localização"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tractor className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Orna</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/login")} className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Sair
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-field opacity-85"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Sistema de Otimização de Rotas
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            Transforme a gestão da sua frota agrícola com tecnologia de ponta
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-primary">
            Por que escolher nosso sistema?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-medium animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-center text-foreground">
                    {benefit.title}
                  </h4>
                  <p className="text-muted-foreground text-center text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Split Sphere Navigation */}
          <div className="flex justify-center items-center py-12">
            <div className="relative w-80 h-80">
              {/* Left Half - Route Optimization */}
              <button
                onClick={() => navigate("/")}
                className="absolute left-0 top-0 w-40 h-80 bg-gradient-hero rounded-l-full flex items-center justify-center group hover:scale-105 transition-transform duration-300 shadow-strong border-r-2 border-primary-foreground"
              >
                <div className="text-center px-4">
                  <Route className="w-12 h-12 text-primary-foreground mb-3 mx-auto animate-float" />
                  <p className="text-primary-foreground font-bold text-sm">
                    Otimização<br />de Rotas
                  </p>
                </div>
              </button>

              {/* Right Half - Machine Rental */}
              <button
                onClick={() => navigate("/machines")}
                className="absolute right-0 top-0 w-40 h-80 bg-gradient-earth rounded-r-full flex items-center justify-center group hover:scale-105 transition-transform duration-300 shadow-strong border-l-2 border-secondary-foreground"
              >
                <div className="text-center px-4">
                  <Tractor className="w-12 h-12 text-secondary-foreground mb-3 mx-auto animate-float" style={{ animationDelay: '0.5s' }} />
                  <p className="text-secondary-foreground font-bold text-sm">
                    Aluguel de<br />Máquinas
                  </p>
                </div>
              </button>

              {/* Center line decoration */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-80 bg-accent z-10"></div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-primary text-primary-foreground border-none shadow-strong max-w-2xl mx-auto">
              <CardContent className="py-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-float" />
                <h3 className="text-2xl font-bold mb-4">
                  Pronto para revolucionar sua gestão agrícola?
                </h3>
                <p className="mb-6 text-primary-foreground/90">
                  Junte-se a centenas de produtores que já otimizam suas operações
                </p>
                <Button 
                  variant="accent" 
                  size="lg"
                  onClick={() => navigate("/machines")}
                >
                  Explorar Máquinas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
