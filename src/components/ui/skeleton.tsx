export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--color-separator)] rounded-xl ${className}`} />
  );
}
