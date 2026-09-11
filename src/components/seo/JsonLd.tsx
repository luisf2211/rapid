/**
 * Inyecta structured data (JSON-LD) en el HTML server-rendered.
 * Acepta uno o varios objetos schema.org.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // El contenido es generado por nosotros (no input de usuario sin sanitizar).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
