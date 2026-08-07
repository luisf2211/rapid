/**
 * VIN validation utilities.
 * A standard VIN is 17 characters, uses A-H, J-N, P, R-Z, 0-9 (no I, O, Q).
 */

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Transliteration values for check digit calculation */
const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
  "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

/** Position weights for VIN check digit */
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Check if a VIN has valid format (17 chars, valid charset).
 */
export function isVinFormatValid(vin: string): boolean {
  return VIN_REGEX.test(vin);
}

/**
 * Validate the VIN check digit (position 9).
 * Returns true if check digit is valid, false otherwise.
 * Note: some international VINs may not follow check digit rules.
 */
export function isVinCheckDigitValid(vin: string): boolean {
  if (!isVinFormatValid(vin)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    const value = TRANSLITERATION[char];
    if (value === undefined) return false;
    sum += value * WEIGHTS[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? "X" : String(remainder);
  return vin[8] === checkDigit;
}

/**
 * Full VIN validation. Returns structured result.
 */
export function validateVin(vin: string): {
  valid: boolean;
  formatValid: boolean;
  checkDigitValid: boolean;
  error?: string;
} {
  if (!vin || vin.length !== 17) {
    return { valid: false, formatValid: false, checkDigitValid: false, error: "El VIN debe tener 17 caracteres" };
  }
  if (!isVinFormatValid(vin)) {
    return { valid: false, formatValid: false, checkDigitValid: false, error: "El VIN contiene caracteres invalidos (I, O, Q no permitidos)" };
  }
  const checkDigitValid = isVinCheckDigitValid(vin);
  return {
    valid: true,
    formatValid: true,
    checkDigitValid,
    error: checkDigitValid ? undefined : "El digito verificador no coincide (puede ser valido en algunos mercados)",
  };
}
