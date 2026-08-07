/**
 * NHTSA vPIC VIN decoder — server-side only.
 * Normalizes the large NHTSA response into a compact DTO.
 */

export type VinDecodeResult = {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  series: string | null;
  vehicleType: string | null;
  bodyType: string | null;
  engine: {
    displacement: string | null;
    cylinders: number | null;
    horsepower: number | null;
    configuration: string | null;
    model: string | null;
  };
  fuel: {
    primary: string | null;
    secondary: string | null;
    electrification: string | null;
  };
  transmission: {
    type: string | null;
    speeds: number | null;
  };
  driveType: string | null;
  doors: number | null;
  seats: number | null;
  manufacturing: {
    manufacturer: string | null;
    country: string | null;
  };
  /** Whether NHTSA had meaningful data */
  decoded: boolean;
  /** Any error messages from NHTSA */
  nhtsaErrors: string[];
};

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";
const TIMEOUT_MS = 8000;

function emptyToNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "Not Applicable" ? null : trimmed;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type NhtsaRow = Record<string, string | number | null>;

function mapNhtsaResponse(vin: string, row: NhtsaRow): VinDecodeResult {
  const errorCode = String(row.ErrorCode ?? "");
  const errorText = emptyToNull(row.ErrorText);
  const nhtsaErrors: string[] = [];

  // ErrorCode "0" means success. Other codes mean issues.
  if (errorCode && errorCode !== "0") {
    if (errorText) nhtsaErrors.push(errorText);
  }

  const make = emptyToNull(row.Make);
  const model = emptyToNull(row.Model);
  const year = toNumber(row.ModelYear);
  const decoded = !!(make || model || year);

  return {
    vin,
    make,
    model,
    year,
    trim: emptyToNull(row.Trim),
    series: emptyToNull(row.Series),
    vehicleType: emptyToNull(row.VehicleType),
    bodyType: emptyToNull(row.BodyClass),
    engine: {
      displacement: emptyToNull(row.DisplacementL),
      cylinders: toNumber(row.EngineCylinders),
      horsepower: toNumber(row.EngineHP),
      configuration: emptyToNull(row.EngineConfiguration),
      model: emptyToNull(row.EngineModel),
    },
    fuel: {
      primary: emptyToNull(row.FuelTypePrimary),
      secondary: emptyToNull(row.FuelTypeSecondary),
      electrification: emptyToNull(row.ElectrificationLevel),
    },
    transmission: {
      type: emptyToNull(row.TransmissionStyle),
      speeds: toNumber(row.TransmissionSpeeds),
    },
    driveType: emptyToNull(row.DriveType),
    doors: toNumber(row.Doors),
    seats: toNumber(row.Seats),
    manufacturing: {
      manufacturer: emptyToNull(row.Manufacturer),
      country: emptyToNull(row.PlantCountry),
    },
    decoded,
    nhtsaErrors,
  };
}

/**
 * Decode a VIN using the NHTSA vPIC API.
 * Server-side only — do not call from client components.
 */
export async function decodeVinFromNhtsa(vin: string): Promise<VinDecodeResult> {
  const url = `${NHTSA_BASE}/${encodeURIComponent(vin)}?format=json`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        vin,
        make: null, model: null, year: null, trim: null, series: null,
        vehicleType: null, bodyType: null,
        engine: { displacement: null, cylinders: null, horsepower: null, configuration: null, model: null },
        fuel: { primary: null, secondary: null, electrification: null },
        transmission: { type: null, speeds: null },
        driveType: null, doors: null, seats: null,
        manufacturing: { manufacturer: null, country: null },
        decoded: false,
        nhtsaErrors: [`NHTSA responded with status ${res.status}`],
      };
    }

    const data = await res.json();
    const results = data?.Results;
    if (!Array.isArray(results) || results.length === 0) {
      return {
        vin,
        make: null, model: null, year: null, trim: null, series: null,
        vehicleType: null, bodyType: null,
        engine: { displacement: null, cylinders: null, horsepower: null, configuration: null, model: null },
        fuel: { primary: null, secondary: null, electrification: null },
        transmission: { type: null, speeds: null },
        driveType: null, doors: null, seats: null,
        manufacturing: { manufacturer: null, country: null },
        decoded: false,
        nhtsaErrors: ["No results from NHTSA"],
      };
    }

    return mapNhtsaResponse(vin, results[0]);
  } catch (e) {
    clearTimeout(timeout);
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return {
      vin,
      make: null, model: null, year: null, trim: null, series: null,
      vehicleType: null, bodyType: null,
      engine: { displacement: null, cylinders: null, horsepower: null, configuration: null, model: null },
      fuel: { primary: null, secondary: null, electrification: null },
      transmission: { type: null, speeds: null },
      driveType: null, doors: null, seats: null,
      manufacturing: { manufacturer: null, country: null },
      decoded: false,
      nhtsaErrors: [msg.includes("abort") ? "Timeout al consultar NHTSA" : msg],
    };
  }
}
