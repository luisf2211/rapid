import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewWorkOrderForm } from "./NewWorkOrderForm";

export default function NewWorkOrderPage() {
  return (
    <>
      <PageHeader
        title="Nueva orden de recepción"
        subtitle="Registra el vehículo, su condición y el checklist de recepción."
        actions={
          <Link href="/work-orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewWorkOrderForm />
    </>
  );
}
