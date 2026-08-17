export function formatError(message: string, status = 400) {
  return { error: message, status };
}

export function isExpiringSoon(expiryDate: Date | string, days = 30): boolean {
  const targetDate = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= days;
}
