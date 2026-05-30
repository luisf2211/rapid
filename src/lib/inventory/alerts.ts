export type StockAlertLevel = "out" | "low";

export type InventoryStockAlert = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  available: number;
  minQuantity: number | null;
  level: StockAlertLevel;
};

export function stockAlertLabel(alert: InventoryStockAlert): string {
  if (alert.level === "out") {
    return `Sin stock (${alert.available} ${alert.unit})`;
  }
  const min = alert.minQuantity ?? 0;
  return `Stock bajo: ${alert.available} ${alert.unit} (mín. ${min})`;
}
