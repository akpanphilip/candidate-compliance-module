function urgency(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Expired', className: 'bg-rose-50 text-rose-700 ring-rose-600/20' };
  if (diffDays <= 30) return { label: 'Expiring soon', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' };
  return { label: 'Valid', className: 'bg-brand-50 text-brand-700 ring-brand-600/20' };
}

export default function StatusBadge({ expiryDate }: { expiryDate: string }) {
  const { label, className } = urgency(expiryDate);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}
