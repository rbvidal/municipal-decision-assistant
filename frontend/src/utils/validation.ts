export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

export function hasUppercase(value: string): boolean {
  return /[A-ZÄÖÜ]/.test(value);
}

export function hasNumber(value: string): boolean {
  return /[0-9]/.test(value);
}

export function hasSpecialChar(value: string): boolean {
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
