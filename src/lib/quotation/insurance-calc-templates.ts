/**
 * Plantillas de cálculo de aseguradoras.
 *
 * Cada plantilla define cómo una aseguradora calcula el total autorizado
 * a partir del subtotal y el deducible.
 *
 * Para agregar una nueva plantilla:
 * 1. Crear una función que implemente InsuranceCalcFn
 * 2. Registrarla en INSURANCE_CALC_TEMPLATES con un key único
 * 3. Agregar su metadata en INSURANCE_CALC_TEMPLATE_OPTIONS
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type InsuranceCalcResult = {
  /** Subtotal (mano de obra + repuestos) antes de impuesto */
  subtotal: number;
  /** Monto del ITBIS calculado */
  taxAmount: number;
  /** Deducible aplicado (puede diferir del input si la plantilla lo transforma) */
  deductibleApplied: number;
  /** Total autorizado final */
  grandTotal: number;
  /** Detalle adicional para mostrar en UI (nombre de cada paso) */
  breakdown: { label: string; amount: number }[];
};

export type InsuranceCalcInput = {
  /** Subtotal antes de impuesto (labor + repuestos - descuento) */
  subtotal: number;
  /** Monto del deducible configurado en la cotización */
  deductible: number;
};

export type InsuranceCalcFn = (input: InsuranceCalcInput) => InsuranceCalcResult;

// ─── Plantillas ─────────────────────────────────────────────────────────────

const TAX_RATE = 0.18;

/**
 * Seguros Patria:
 * Subtotal → + ITBIS 18% → − Deducible → Total autorizado
 * Total = (Subtotal × 1.18) - Deducible
 */
function calcPatria(input: InsuranceCalcInput): InsuranceCalcResult {
  const { subtotal, deductible } = input;
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
  const subtotalWithTax = Math.round((subtotal + taxAmount) * 100) / 100;
  const grandTotal = Math.round((subtotalWithTax - deductible) * 100) / 100;

  return {
    subtotal,
    taxAmount,
    deductibleApplied: deductible,
    grandTotal: Math.max(0, grandTotal),
    breakdown: [
      { label: "Subtotal", amount: subtotal },
      { label: "ITBIS 18%", amount: taxAmount },
      { label: "Subtotal + ITBIS", amount: subtotalWithTax },
      { label: "Deducible", amount: -deductible },
      { label: "Total autorizado", amount: Math.max(0, grandTotal) },
    ],
  };
}

/**
 * Atlántica Seguros:
 * Monto Neto → − Deducible sin impuesto → Subtotal → + ITBIS 18% → Total
 *
 * DeducibleSinImpuesto = Deducible / 1.18
 * Subtotal = MontoNeto - DeducibleSinImpuesto
 * ITBIS = Subtotal × 0.18
 * Total = Subtotal + ITBIS
 */
function calcAtlantica(input: InsuranceCalcInput): InsuranceCalcResult {
  const { subtotal: montoNeto, deductible } = input;
  const deductibleSinImpuesto = Math.round((deductible / (1 + TAX_RATE)) * 100) / 100;
  const subtotalAfterDeductible = Math.round((montoNeto - deductibleSinImpuesto) * 100) / 100;
  const taxAmount = Math.round(subtotalAfterDeductible * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((subtotalAfterDeductible + taxAmount) * 100) / 100;

  return {
    subtotal: montoNeto,
    taxAmount,
    deductibleApplied: deductibleSinImpuesto,
    grandTotal: Math.max(0, grandTotal),
    breakdown: [
      { label: "Monto neto", amount: montoNeto },
      { label: "Deducible", amount: deductible },
      { label: "Deducible sin ITBIS", amount: -deductibleSinImpuesto },
      { label: "Subtotal", amount: subtotalAfterDeductible },
      { label: "ITBIS 18%", amount: taxAmount },
      { label: "Total a pagar", amount: Math.max(0, grandTotal) },
    ],
  };
}

/**
 * Plantilla por defecto (sin lógica especial):
 * Subtotal → + ITBIS 18% → − Deducible → Total
 * Igual que Patria, sirve como fallback genérico.
 */
function calcDefault(input: InsuranceCalcInput): InsuranceCalcResult {
  return calcPatria(input);
}

// ─── Registro de plantillas ─────────────────────────────────────────────────

export const INSURANCE_CALC_TEMPLATES: Record<string, InsuranceCalcFn> = {
  PATRIA: calcPatria,
  ATLANTICA: calcAtlantica,
  DEFAULT: calcDefault,
};

/** Opciones para mostrar en el dropdown de configuración de la aseguradora */
export const INSURANCE_CALC_TEMPLATE_OPTIONS: { value: string; label: string; description: string }[] = [
  {
    value: "PATRIA",
    label: "Seguros Patria",
    description: "Subtotal + ITBIS − Deducible = Total",
  },
  {
    value: "ATLANTICA",
    label: "Atlántica Seguros",
    description: "Monto Neto − (Deducible/1.18) + ITBIS = Total",
  },
  {
    value: "DEFAULT",
    label: "Estándar",
    description: "Subtotal + ITBIS − Deducible = Total",
  },
];

// ─── API pública ────────────────────────────────────────────────────────────

/**
 * Calcula los totales de una cotización de seguro usando la plantilla indicada.
 * Si no se especifica plantilla o no existe, usa DEFAULT.
 */
export function computeInsuranceTotals(
  templateKey: string | null | undefined,
  input: InsuranceCalcInput,
): InsuranceCalcResult {
  const calc = INSURANCE_CALC_TEMPLATES[templateKey ?? "DEFAULT"] ?? INSURANCE_CALC_TEMPLATES.DEFAULT;
  return calc(input);
}
