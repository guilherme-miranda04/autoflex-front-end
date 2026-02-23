import { getProduction } from '@/api/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProductionSuggestionDTO } from '@/types/production.interface';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Factory } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProductionPage() {
  const [production, setProduction] = useState<ProductionSuggestionDTO[]>([]);

  // Supondo que 'data' seja o array que você postou
  useEffect(() => {
    async function fetchData() {
      try {
        const productionData = await getProduction();
        setProduction(productionData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load initial data.');
      }
    }
    fetchData();
  }, []);

  const totalPotentialValue = production.reduce(
    (acc, curr) => acc + curr.totalValue,
    0,
  );

  const maxQuantity = Math.max(...production.map((p) => p.quantityPossible), 0);

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales Potential
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalPotentialValue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on raw material inventory
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Grid de Produtos */}
      <h2 className="text-xl font-semibold tracking-tight">
        Production Capacity
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {production.map((item, i) => (
          <motion.tr
            key={item.productID}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border-b transition-colors hover:bg-muted/50"
          >
            <Card key={item.productID} className="overflow-hidden p-0">
              <CardHeader className="bg-muted/50 pb-4 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {item.productName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      ID: {item.productID.slice(0, 8)}
                    </p>
                  </div>
                  <Factory className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Qty. Produceable:
                  </span>
                  <span
                    className={`font-bold ${(item.quantityPossible / maxQuantity) * 100 > 70 ? 'text-green-600' : (item.quantityPossible / maxQuantity) * 100 > 30 ? 'text-yellow-500' : 'text-red-600'}`}
                  >
                    {item.quantityPossible} u.
                  </span>
                </div>

                {/* Uma barra de progresso visual (opcional) */}
                <div className="w-full bg-secondary h-2 rounded-full mb-4">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(item.quantityPossible / maxQuantity) * 100}%`,
                    }}
                  />
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Unit Price: ${item.unitPrice.toFixed(2)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Value in Stock:
                    </p>
                    <p className="font-semibold text-primary">
                      ${item.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.tr>
        ))}
      </div>
      {production.length === 0 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/10 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            Não é possível fazer nenhuma produção
          </div>
        </div>
      )}
    </div>
  );
}
