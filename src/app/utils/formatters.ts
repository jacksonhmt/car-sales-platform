export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
  let formatted = parts[0];
  if (parts[1]) formatted += '.' + parts[1];
  if (parts[2]) formatted += '.' + parts[2];
  if (digits.length > 9) formatted += '-' + digits.slice(9);
  return formatted;
}

export function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  const splitAt = digits.length > 10 ? 7 : 6;
  const area = `(${digits.slice(0, 2)}) `;
  const rest = digits.slice(2);
  if (digits.length <= splitAt) return area + rest;
  return area + digits.slice(2, splitAt) + '-' + digits.slice(splitAt);
}
