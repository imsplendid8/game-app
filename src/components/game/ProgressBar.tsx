interface ProgressBarProps {
  current: number;
  total: number;
}

/** 전체 진행 바. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/60"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`전체 ${total}문제 중 ${current}번째`}
    >
      <div
        className="h-full rounded-full bg-brand-gradient transition-all duration-500"
        style={{ width: `${pct}%` }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/2 bg-white/30"
        />
      </div>
    </div>
  );
}
