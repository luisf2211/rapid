import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewWorkOrderForm } from "./NewWorkOrderForm";
import { makeDefaultWorkOrderFormValues } from "@/lib/work-order/form-mapper";

export default function NewWorkOrderPage() {
  const defaultValues = makeDefaultWorkOrderFormValues();

  return (
    <>
      <div className="card border-rapid-green/30 bg-rapid-green-soft/40 p-4 mb-4 text-sm">
        <p className="font-semibold text-rapid-green-dark">Flujo recomendado</p>
        <p className="text-rapid-text-muted mt-1">
          Primero crea una{" "}
          <Link href="/quotations/new" className="text-rapid-green font-semibold hover:underline">
            cotización
          </Link>
          , aprueba con el cliente y usa &quot;Crear orden de recepción&quot;. Esta pantalla
          es para recepción directa sin cotización previa.
        </p>
      </div>
      <PageHeader
        title="Nueva orden de recepción"
        subtitle="Registra el vehículo, su condición y el checklist de recepción."
        actions={
          <Link href="/work-orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewWorkOrderForm defaultValues={defaultValues} />
    </>
  );
}
