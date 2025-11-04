// Utility function to format numbers in Indian numbering system
// Groups: 2,2,3 from the right (e.g., 100000 -> 1,00,000)
export function formatIndianNumber(num, decimals = 2) {
  const n = Number(num);
  if (isNaN(n)) return '0.00';

  const [integerPart, decimalPart] = n.toFixed(decimals).split('.');
  const absInt = Math.abs(parseInt(integerPart, 10)).toString();

  let formatted = '';
  let count = 0;

  // Process from right to left
  for (let i = absInt.length - 1; i >= 0; i--) {
    formatted = absInt[i] + formatted;
    count++;
    if (count === 3 && i > 0) {
      formatted = ',' + formatted;
      count = 0;
    } else if (count === 2 && i > 0 && absInt.length - i > 3) {
      formatted = ',' + formatted;
      count = 0;
    }
  }

  // Add sign back if negative
  if (n < 0) formatted = '-' + formatted;

  // Add decimal part
  if (decimals > 0) formatted += '.' + decimalPart;

  return formatted;
}
