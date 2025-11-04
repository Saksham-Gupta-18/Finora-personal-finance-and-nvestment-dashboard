export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /.+@.+\..+/.test(value);
}

export function isValidTransactionType(value) {
  return value === 'income' || value === 'expense' || value === 'saving';
}


