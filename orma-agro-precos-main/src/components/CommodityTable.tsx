import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Commodity {
  name: string;
  price: string;
  change: number;
  unit: string;
  volume: string;
}

interface CommodityTableProps {
  commodities: Commodity[];
}

export const CommodityTable = ({ commodities }: CommodityTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas as Commodities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commodity</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Variação</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commodities.map((commodity, index) => {
              const isPositive = commodity.change >= 0;
              return (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{commodity.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">{commodity.price}</span>
                      <span className="text-xs text-muted-foreground">{commodity.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="font-medium">
                        {isPositive ? "+" : ""}
                        {commodity.change.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {commodity.volume}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
