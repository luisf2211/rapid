import type { QuotationPrintData } from "@/lib/quotation/print-data";
import { resolvePhotoUrl } from "@/lib/photos";

export function PrintPhotos({
  photos,
  title = "FOTOGRAFÍAS DEL VEHÍCULO",
  max = 3,
}: {
  photos: QuotationPrintData["photos"];
  title?: string;
  max?: number;
}) {
  const slots = [...photos.slice(0, max)];
  while (slots.length < max) {
    slots.push({ url: "", description: null });
  }

  return (
    <section>
      <h3 className="qdoc-section-title">{title}</h3>
      <div className="qdoc-photos">
        {slots.map((p, i) => (
          <div key={i} className="qdoc-photo">
            {p.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvePhotoUrl(p.url)}
                alt={p.description ?? `Foto ${i + 1}`}
              />
            ) : (
              <div className="qdoc-photo-placeholder">Sin foto</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
