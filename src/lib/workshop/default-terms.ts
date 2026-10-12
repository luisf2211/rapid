/**
 * Condiciones legales por defecto de la orden de recepción.
 * Se usan cuando el taller no ha definido sus propios términos en Configuración.
 * El texto vive aquí (no incrustado en el componente de impresión) para poder
 * versionarlo y publicarlo en la URL pública de términos.
 */

export const DEFAULT_TERMS_VERSION = 1;

export const DEFAULT_TERMS: string[] = [
  "El cliente declara ser propietario del vehículo o estar debidamente autorizado para solicitar los servicios objeto de esta orden de trabajo.",
  "El taller realizará únicamente los trabajos autorizados por el cliente. Cualquier trabajo adicional requerirá aprobación previa del propietario o su representante.",
  "El cliente autoriza al taller a efectuar pruebas de manejo, inspecciones y movimientos internos del vehículo que sean necesarios para la correcta ejecución de los trabajos contratados.",
  "El taller no se responsabiliza por objetos personales, dinero, herramientas, mercancías u otros bienes dejados dentro del vehículo.",
  "Cuando el vehículo presente daños ocultos, defectos mecánicos, eléctricos o estructurales no visibles al momento de la recepción, el taller notificará al cliente para su evaluación y aprobación correspondiente.",
  "Los trabajos de pintura y reparación de carrocería cuentan con garantía limitada contra defectos de aplicación, desprendimiento prematuro, agrietamiento o fallas atribuibles directamente al proceso realizado por el taller, por un período de 6 meses a partir de la fecha de entrega.",
  "La garantía no cubre daños ocasionados por accidentes posteriores, mal uso, negligencia, fenómenos naturales, exposición a sustancias químicas, corrosión preexistente, modificaciones realizadas por terceros o falta de mantenimiento.",
  "Las piezas, materiales o repuestos suministrados por el cliente no estarán cubiertos por garantía del taller.",
  "El vehículo deberá ser retirado dentro de los 5 días siguientes a la notificación de finalización de los trabajos. Vencido dicho plazo, podrán generarse cargos por almacenamiento.",
  "El cliente acepta que el vehículo permanecerá bajo custodia del taller únicamente durante el período de reparación y sujeto a las condiciones aquí establecidas.",
  "La entrega del vehículo y la firma de conformidad por parte del cliente constituyen aceptación de los trabajos realizados, salvo observaciones expresamente anotadas en el documento de entrega.",
  "Cualquier reclamación relacionada con los trabajos efectuados deberá presentarse dentro del período de garantía establecido y acompañarse de la documentación correspondiente.",
];

/** Texto plano por defecto (para prellenar el editor del taller). */
export const DEFAULT_TERMS_TEXT = DEFAULT_TERMS.join("\n\n");

/**
 * Devuelve los párrafos de términos vigentes de un taller.
 * Usa los personalizados si existen; si no, los por defecto.
 */
export function resolveTerms(termsContent: string | null | undefined): string[] {
  const custom = termsContent?.trim();
  if (!custom) return DEFAULT_TERMS;
  return custom
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
