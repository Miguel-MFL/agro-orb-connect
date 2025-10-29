import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceCardProps {
  title: string;
  price: string;
  change: number;
  unit: string;
  icon?: React.ReactNode;
}

export const PriceCard = ({ title, price, change, unit, icon }: PriceCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{price}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-success" : "text-destructive"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
