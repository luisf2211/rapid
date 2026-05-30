/** Etiqueta de producto en requisición vinculada al inventario (máx. 150 caracteres). */
export function formatRequisitionProductName(sku: string, name: string): string {
  const label = `${sku} · ${name}`;
  return label.length <= 150 ? label : `${sku} · ${name}`.slice(0, 150);
}
