import { Sprout, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  selectedMarket: string;
  onMarketChange: (market: string) => void;
  onRefresh: () => void;
  onBack?: () => void;
}

export const Header = ({ selectedMarket, onMarketChange, onRefresh, onBack }: HeaderProps) => {
  const markets = ["Brasil", "Chicago", "New York"];

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Sprout className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Orma</h1>
              <p className="text-sm text-muted-foreground">Cotações em Tempo Real</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {onBack && (
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className="font-medium"
                title="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="font-medium"
              title="Atualizar preços"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {markets.map((market) => (
              <button
                key={market}
                onClick={() => onMarketChange(market)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedMarket === market
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {market}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
