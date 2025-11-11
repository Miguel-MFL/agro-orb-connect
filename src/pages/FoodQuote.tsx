import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, Package, TrendingDown, Truck } from "lucide-react";
import { toast } from "sonner";

interface QuoteRequest {
  id: string;
  product: string;
  quantity: string;
  unit: string;
  description: string;
  date: string;
  status: "pending" | "quoted" | "accepted";
  price?: string;
}

const FoodQuote = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    unit: "kg",
    description: ""
  });

  const [quotes, setQuotes] = useState<QuoteRequest[]>([
    {
      id: "1",
      product: "Milho",
      quantity: "1000",
      unit: "kg",
      description: "Milho para ração",
      date: "2025-01-15",
      status: "quoted",
      price: "R$ 45.000,00"
    },
    {
      id: "2",
      product: "Soja",
      quantity: "500",
      unit: "kg",
      description: "Soja para plantio",
      date: "2025-01-10",
      status: "accepted",
      price: "R$ 75.000,00"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product || !formData.quantity) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const newQuote: QuoteRequest = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status: "pending"
    };

    setQuotes([newQuote, ...quotes]);
    
    setFormData({
      product: "",
      quantity: "",
      unit: "kg",
      description: ""
    });

    toast.success("Solicitação de cotação enviada com sucesso!");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: QuoteRequest["status"]) => {
    switch(status) {
      case "pending": return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
      case "quoted": return "bg-blue-500/10 text-blue-700 border-blue-300";
      case "accepted": return "bg-green-500/10 text-green-700 border-green-300";
    }
  };

  const getStatusText = (status: QuoteRequest["status"]) => {
    switch(status) {
      case "pending": return "Aguardando";
      case "quoted": return "Cotado";
      case "accepted": return "Aceito";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-4 px-6 shadow-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Orma - Cotação de Alimentos</h1>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 shadow-medium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Cotações Ativas</p>
                  <p className="text-2xl font-bold text-foreground">{quotes.filter(q => q.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-medium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Economia Total</p>
                  <p className="text-2xl font-bold text-foreground">R$ 12.450</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-medium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Entregas Agendadas</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Nova Cotação
                </CardTitle>
                <CardDescription>
                  Solicite cotação para alimentos e insumos agrícolas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto *</Label>
                    <Select value={formData.product} onValueChange={(value) => handleInputChange("product", value)}>
                      <SelectTrigger className="border-primary/30">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milho">Milho</SelectItem>
                        <SelectItem value="soja">Soja</SelectItem>
                        <SelectItem value="trigo">Trigo</SelectItem>
                        <SelectItem value="fertilizante">Fertilizante</SelectItem>
                        <SelectItem value="racao">Ração Animal</SelectItem>
                        <SelectItem value="semente">Sementes</SelectItem>
                        <SelectItem value="agrotoxicos">Agrotóxicos</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="1000"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", e.target.value)}
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                        <SelectTrigger className="border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="ton">Toneladas</SelectItem>
                          <SelectItem value="litros">Litros</SelectItem>
                          <SelectItem value="sacas">Sacas</SelectItem>
                          <SelectItem value="unidades">Unidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Observações</Label>
                    <Textarea
                      id="description"
                      placeholder="Informações adicionais sobre o pedido..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="border-primary/30 focus:border-primary min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Solicitar Cotação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quotes List Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle>Minhas Cotações</CardTitle>
                <CardDescription>
                  Histórico de cotações solicitadas e em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma cotação encontrada</p>
                    </div>
                  ) : (
                    quotes.map((quote) => (
                      <Card key={quote.id} className="border-primary/10 hover:border-primary/30 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground capitalize">
                                  {quote.product}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                                  {getStatusText(quote.status)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Quantidade: <span className="font-medium text-foreground">{quote.quantity} {quote.unit}</span>
                              </p>
                              {quote.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {quote.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Solicitado em: {new Date(quote.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {quote.price && (
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Valor</p>
                                <p className="text-xl font-bold text-primary">{quote.price}</p>
                              </div>
                            )}
                          </div>
                          {quote.status === "quoted" && (
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  setQuotes(quotes.map(q => 
                                    q.id === quote.id ? { ...q, status: "accepted" } : q
                                  ));
                                  toast.success("Cotação aceita com sucesso!");
                                }}
                              >
                                Aceitar Cotação
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Negociar Preço
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodQuote;
