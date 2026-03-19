interface IssueBadgeProps {
  label?: string | null;
  className?: string;
}

export default function IssueBadge({ label, className = "" }: IssueBadgeProps) {
  if (!label) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#A1887F] ${className}`.trim()}
    >
      {label}
    </span>
  );
}
