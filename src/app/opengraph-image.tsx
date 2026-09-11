import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const alt = "Rapid · Cotiza la reparación de tu vehículo online";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Pintura automotriz · Detailing",
    title: "Cotiza la reparación de tu vehículo online",
    subtitle: "Manda fotos, recibe tu propuesta y sigue el estado. Sin filas.",
  });
}
