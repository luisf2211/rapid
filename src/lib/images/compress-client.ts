/**
 * Comprime/redimensiona una imagen en el navegador antes de subirla.
 * Reduce fotos de celular (que pueden pesar 5-15 MB) a ~1-2 MB manteniendo
 * buena calidad, para que siempre pasen el límite del servidor y suban rápido.
 *
 * Devuelve un File JPEG. Si algo falla, devuelve el archivo original.
 */
export async function compressImage(
  file: File,
  opts?: { maxDimension?: number; quality?: number; maxBytes?: number },
): Promise<File> {
  const maxDimension = opts?.maxDimension ?? 1600;
  const quality = opts?.quality ?? 0.8;
  const maxBytes = opts?.maxBytes ?? 10 * 1024 * 1024;

  // Si no es imagen o el entorno no soporta canvas, no tocar.
  if (typeof document === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }
  // GIF puede ser animado; no lo re-comprimimos.
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (!blob) return file;

    // Si por alguna razón sigue muy grande, reintenta con menos calidad.
    let finalBlob = blob;
    if (finalBlob.size > maxBytes) {
      const smaller = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.6),
      );
      if (smaller) finalBlob = smaller;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([finalBlob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback abajo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fitWithin(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}
