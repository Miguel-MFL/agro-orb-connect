import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { PriceCard } from "@/components/PriceCard";
import { CommodityTable } from "@/components/CommodityTable";
import { Wheat, Beef } from "lucide-react";

const Index = () => {
  const [selectedMarket, setSelectedMarket] = useState("Brasil");
  const [refreshKey, setRefreshKey] = useState(0);

  const generateRandomChange = (base: number) => {
    const variation = (Math.random() - 0.5) * 5;
    return Number((base + variation).toFixed(2));
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Dados mockados - em produção viriam de uma API
  const getMarketData = (market: string) => {
    const baseData = {
      Brasil: {
        soja: { price: "147.50", change: generateRandomChange(2.34), unit: "R$/saca" },
        milho: { price: "68.20", change: generateRandomChange(-0.87), unit: "R$/saca" },
        boi: { price: "312.00", change: generateRandomChange(1.45), unit: "R$/@" },
        commodities: [
          { name: "Algodão", price: "189.30", change: generateRandomChange(0.98), unit: "R$/@", volume: "3.6k" },
          { name: "Amendoim", price: "215.40", change: generateRandomChange(1.54), unit: "R$/saca", volume: "2.1k" },
          { name: "Arroz", price: "95.80", change: generateRandomChange(-0.45), unit: "R$/saca", volume: "7.2k" },
          { name: "Boi Gordo", price: "312.00", change: generateRandomChange(1.45), unit: "R$/@", volume: "5.2k" },
          { name: "Cacau", price: "892.50", change: generateRandomChange(2.87), unit: "R$/@", volume: "1.8k" },
          { name: "Café Arábica", price: "1,245.00", change: generateRandomChange(3.21), unit: "R$/saca", volume: "4.1k" },
          { name: "Feijão", price: "178.90", change: generateRandomChange(-1.34), unit: "R$/saca", volume: "3.4k" },
          { name: "Frango", price: "6.75", change: generateRandomChange(0.89), unit: "R$/kg", volume: "8.9k" },
          { name: "Laranja", price: "45.30", change: generateRandomChange(-0.67), unit: "R$/caixa", volume: "4.5k" },
          { name: "Látex", price: "12.40", change: generateRandomChange(1.23), unit: "R$/kg", volume: "1.2k" },
          { name: "Leite", price: "2.45", change: generateRandomChange(0.56), unit: "R$/litro", volume: "12.8k" },
          { name: "Mandioca", price: "685.00", change: generateRandomChange(-0.78), unit: "R$/ton", volume: "2.9k" },
          { name: "Milho", price: "68.20", change: generateRandomChange(-0.87), unit: "R$/saca", volume: "8.3k" },
          { name: "Ovo", price: "8.95", change: generateRandomChange(1.12), unit: "R$/dúzia", volume: "6.7k" },
          { name: "Soja", price: "147.50", change: generateRandomChange(2.34), unit: "R$/saca", volume: "12.5k" },
          { name: "Trigo", price: "1,156.00", change: generateRandomChange(-2.34), unit: "R$/ton", volume: "2.8k" },
        ],
      },
      Chicago: {
        soja: { price: "1,487.25", change: generateRandomChange(1.89), unit: "¢/bushel" },
        milho: { price: "624.50", change: generateRandomChange(-1.23), unit: "¢/bushel" },
        boi: { price: "178.30", change: generateRandomChange(0.67), unit: "$/cwt" },
        commodities: [
          { name: "Algodão", price: "85.40", change: generateRandomChange(0.98), unit: "¢/lb", volume: "18.3k" },
          { name: "Amendoim", price: "34.25", change: generateRandomChange(1.12), unit: "¢/lb", volume: "8.4k" },
          { name: "Arroz", price: "18.75", change: generateRandomChange(-0.34), unit: "$/cwt", volume: "21.5k" },
          { name: "Aveia", price: "412.00", change: generateRandomChange(-0.56), unit: "¢/bushel", volume: "11.5k" },
          { name: "Boi", price: "178.30", change: generateRandomChange(0.67), unit: "$/cwt", volume: "22.1k" },
          { name: "Cacau", price: "4,850.00", change: generateRandomChange(3.45), unit: "$/ton", volume: "12.8k" },
          { name: "Café", price: "235.60", change: generateRandomChange(2.78), unit: "¢/lb", volume: "24.5k" },
          { name: "Feijão", price: "28.90", change: generateRandomChange(-0.89), unit: "$/cwt", volume: "9.7k" },
          { name: "Frango", price: "1.45", change: generateRandomChange(0.67), unit: "$/lb", volume: "32.4k" },
          { name: "Leite", price: "19.85", change: generateRandomChange(0.89), unit: "$/cwt", volume: "15.7k" },
          { name: "Madeira", price: "567.20", change: generateRandomChange(-1.98), unit: "$/mbf", volume: "8.2k" },
          { name: "Milho", price: "624.50", change: generateRandomChange(-1.23), unit: "¢/bushel", volume: "38.7k" },
          { name: "Ovo", price: "3.25", change: generateRandomChange(1.45), unit: "$/dúzia", volume: "19.8k" },
          { name: "Porco", price: "92.45", change: generateRandomChange(1.34), unit: "$/cwt", volume: "18.9k" },
          { name: "Soja", price: "1,487.25", change: generateRandomChange(1.89), unit: "¢/bushel", volume: "45.2k" },
          { name: "Trigo", price: "783.75", change: generateRandomChange(2.14), unit: "¢/bushel", volume: "29.3k" },
        ],
      },
      "New York": {
        soja: { price: "1,502.00", change: generateRandomChange(2.12), unit: "¢/bushel" },
        milho: { price: "631.75", change: generateRandomChange(-0.98), unit: "¢/bushel" },
        boi: { price: "179.85", change: generateRandomChange(1.23), unit: "$/cwt" },
        commodities: [
          { name: "Açúcar #11", price: "24.35", change: generateRandomChange(-1.45), unit: "¢/lb", volume: "32.1k" },
          { name: "Algodão #2", price: "89.72", change: generateRandomChange(0.78), unit: "¢/lb", volume: "21.5k" },
          { name: "Amendoim", price: "35.80", change: generateRandomChange(1.34), unit: "¢/lb", volume: "7.9k" },
          { name: "Arroz", price: "19.20", change: generateRandomChange(-0.56), unit: "$/cwt", volume: "18.7k" },
          { name: "Boi", price: "179.85", change: generateRandomChange(1.23), unit: "$/cwt", volume: "25.4k" },
          { name: "Cacau", price: "4,123.00", change: generateRandomChange(4.21), unit: "$/ton", volume: "14.2k" },
          { name: "Café", price: "245.60", change: generateRandomChange(3.67), unit: "¢/lb", volume: "19.8k" },
          { name: "Feijão", price: "29.50", change: generateRandomChange(-1.12), unit: "$/cwt", volume: "8.4k" },
          { name: "Frango", price: "1.52", change: generateRandomChange(0.78), unit: "$/lb", volume: "28.9k" },
          { name: "Laranja (Suco)", price: "278.50", change: generateRandomChange(2.34), unit: "¢/lb", volume: "9.3k" },
          { name: "Látex", price: "1.85", change: generateRandomChange(0.98), unit: "$/kg", volume: "5.6k" },
          { name: "Leite", price: "20.15", change: generateRandomChange(1.05), unit: "$/cwt", volume: "16.2k" },
          { name: "Milho", price: "631.75", change: generateRandomChange(-0.98), unit: "¢/bushel", volume: "41.6k" },
          { name: "Ovo", price: "3.45", change: generateRandomChange(1.67), unit: "$/dúzia", volume: "17.3k" },
          { name: "Soja", price: "1,502.00", change: generateRandomChange(2.12), unit: "¢/bushel", volume: "52.3k" },
          { name: "Trigo", price: "795.30", change: generateRandomChange(1.89), unit: "¢/bushel", volume: "31.2k" },
        ],
      },
    };

    return baseData[market as keyof typeof baseData] || baseData.Brasil;
  };

  const marketData = getMarketData(selectedMarket);

  return (
    <div className="min-h-screen bg-background" key={refreshKey}>
      <Header 
        selectedMarket={selectedMarket} 
        onMarketChange={setSelectedMarket}
        onRefresh={handleRefresh}
        onBack={() => console.log('Voltar - implementar navegação')}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Mercado: {selectedMarket}
          </h2>
          <p className="text-muted-foreground">
            Acompanhe as cotações em tempo real das principais commodities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PriceCard
            title="Soja"
            price={marketData.soja.price}
            change={marketData.soja.change}
            unit={marketData.soja.unit}
            icon={<Wheat className="h-5 w-5" />}
          />
          <PriceCard
            title="Milho"
            price={marketData.milho.price}
            change={marketData.milho.change}
            unit={marketData.milho.unit}
            icon={<Wheat className="h-5 w-5" />}
          />
          <PriceCard
            title="Boi Gordo"
            price={marketData.boi.price}
            change={marketData.boi.change}
            unit={marketData.boi.unit}
            icon={<Beef className="h-5 w-5" />}
          />
        </div>

        <CommodityTable commodities={marketData.commodities} />
      </main>
    </div>
  );
};

export default Index;
