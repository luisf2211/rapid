import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewInventoryPartForm } from "../../new/NewInventoryPartForm";
import { INVENTORY_PART_TYPES } from "@/lib/constants";

export default function NewPaintInventoryPage() {
  return (
    <>
      <PageHeader
        title="Registrar pintura"
        subtitle="La pintura se controla en un inventario separado de materiales."
        actions={
          <Link href="/inventory/paint" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewInventoryPartForm partType={INVENTORY_PART_TYPES.PAINT} />
    </>
  );
}
