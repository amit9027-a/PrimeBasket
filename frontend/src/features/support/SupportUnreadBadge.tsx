
interface SupportUnreadBadgeProps {
  count: number;
}

export default function SupportUnreadBadge({
  count,
}: SupportUnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread support messages`}
      title={`${count} unread support messages`}
      className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
