export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}



export interface ValidationResult {
  valid: boolean;
  message: string;
}

const ok: ValidationResult = { valid: true, message: "" };
const fail = (message: string): ValidationResult => ({ valid: false, message });



export function validateRequired(value: string, fieldName = "This field"): ValidationResult {
  if (!value || !value.trim()) return fail(`${fieldName} is required`);
  return ok;
}

export function validateMinLength(value: string, min: number, fieldName = "This field"): ValidationResult {
  if (value.trim().length < min) return fail(`${fieldName} must be at least ${min} characters`);
  return ok;
}

export function validateMaxLength(value: string, max: number, fieldName = "This field"): ValidationResult {
  if (value.trim().length > max) return fail(`${fieldName} must be at most ${max} characters`);
  return ok;
}



export function validateName(value: string): ValidationResult {
  const name = sanitize(value);
  if (!name) return fail("Name is required");
  if (name.length < 2) return fail("Name must be at least 2 characters");
  if (name.length > 50) return fail("Name must be at most 50 characters");
  if (!/^[a-zA-Z\s\u0980-\u09FF'-]+$/.test(name))
    return fail("Name can only contain letters, spaces, hyphens and apostrophes");
  return ok;
}

// ── Email ──

export function validateEmail(value: string): ValidationResult {
  const email = sanitize(value).toLowerCase();
  if (!email) return fail("Email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address");
  if (email.length > 254) return fail("Email is too long");
  return ok;
}

// ── Password ──

export function validatePassword(value: string): ValidationResult {
  if (!value) return fail("Password is required");
  if (value.length < 6) return fail("Password must be at least 6 characters");
  if (value.length > 128) return fail("Password is too long");
  return ok;
}

export function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (!confirm) return fail("Please confirm your password");
  if (password !== confirm) return fail("Passwords do not match");
  return ok;
}

// ── Phone ──

export function validatePhone(value: string): ValidationResult {
  const phone = sanitize(value);
  if (!phone) return ok; // phone is usually optional
  const digits = phone.replace(/[\s\-().+]/g, "");
  if (!/^\d{7,15}$/.test(digits)) return fail("Please enter a valid phone number");
  return ok;
}

// ── Card ──

export function validateCardNumber(value: string): ValidationResult {
  const card = value.replace(/\s/g, "");
  if (!card) return fail("Card number is required");
  if (!/^\d{13,19}$/.test(card)) return fail("Please enter a valid card number");
  return ok;
}

export function validateCardExpiry(value: string): ValidationResult {
  const expiry = sanitize(value);
  if (!expiry) return fail("Expiration date is required");
  const match = expiry.match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
  if (!match) return fail("Use MM/YY format");
  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (year < currentYear || (year === currentYear && month < currentMonth))
    return fail("Card has expired");
  return ok;
}

export function validateCVC(value: string): ValidationResult {
  const cvc = sanitize(value);
  if (!cvc) return fail("CVC is required");
  if (!/^\d{3,4}$/.test(cvc)) return fail("CVC must be 3 or 4 digits");
  return ok;
}

// ── Address ──

export function validateAddress(value: string, fieldName = "Address"): ValidationResult {
  const addr = sanitize(value);
  if (!addr) return fail(`${fieldName} is required`);
  if (addr.length < 3) return fail(`${fieldName} is too short`);
  if (addr.length > 200) return fail(`${fieldName} is too long`);
  return ok;
}

export function validateZip(value: string): ValidationResult {
  const zip = sanitize(value);
  if (!zip) return fail("ZIP code is required");
  if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(zip)) return fail("Please enter a valid ZIP code");
  return ok;
}

// ── Numbers ──

export function validateNumberOnly(value: string, fieldName = "This field"): ValidationResult {
  if (!/^\d+$/.test(value.trim())) return fail(`${fieldName} must contain only numbers`);
  return ok;
}

// ── Batch helper ──

/** Run multiple validators; returns the first error or `ok` */
export function validate(...results: ValidationResult[]): ValidationResult {
  for (const r of results) {
    if (!r.valid) return r;
  }
  return ok;
}
