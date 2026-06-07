interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function formatBadgeCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export default function NotificationBadge({ count, className = "" }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={`pointer-events-none absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-cream ${className}`}
      aria-label={`${count} message${count > 1 ? "s" : ""} non lu${count > 1 ? "s" : ""}`}
    >
      {formatBadgeCount(count)}
    </span>
  );
}
