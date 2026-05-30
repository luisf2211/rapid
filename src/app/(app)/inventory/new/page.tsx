import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewInventoryPartForm } from "./NewInventoryPartForm";

export default function NewInventoryPartPage() {
  return (
    <>
      <PageHeader
        title="Nueva pieza"
        subtitle="Registra una pieza o material en el inventario del taller."
        actions={
          <Link href="/inventory" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewInventoryPartForm />
    </>
  );
}
