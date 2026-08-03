import type { StatKey, Stats } from "@/types/game";
import { STAT_ICONS, STAT_LABELS, STAT_PRIORITY } from "@/features/game/constants";

const BAR_GRADIENT: Record<StatKey, string> = {
  sense: "from-[#b79bff] to-[#8a63f0]",
  work: "from-[#6ee7c6] to-[#22b892]",
  mental: "from-[#ffd08a] to-[#ffab42]",
  favor: "from-[#ffa8c6] to-[#ff5c90]",
  leaveChance: "from-[#9bd6ff] to-[#3fa8f0]",
};

interface StatBarsProps {
  stats: Stats;
  /** compact: 플레이 화면용 얇은 미니 바 */
  compact?: boolean;
}

/** 5개 능력치 게이지. 색상 외에 항상 아이콘·이름·숫자를 함께 표시 (기획서 4.1). */
export function StatBars({ stats, compact = false }: StatBarsProps) {
  return (
    <ul className={compact ? "space-y-1.5" : "space-y-3"}>
      {STAT_PRIORITY.map((key) => (
        <li key={key} className="flex items-center gap-2">
          <span
            className={`flex shrink-0 items-center gap-1 ${
              compact ? "w-[92px] text-xs" : "w-[108px] text-sm"
            } font-semibold text-subtle`}
          >
            <span aria-hidden>{STAT_ICONS[key]}</span>
            {STAT_LABELS[key]}
          </span>
          <span
            className={`relative flex-1 overflow-hidden rounded-full bg-line ${
              compact ? "h-2.5" : "h-3.5"
            }`}
          >
            <span
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${BAR_GRADIENT[key]} transition-all duration-500`}
              style={{ width: `${stats[key]}%` }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/30"
              />
            </span>
          </span>
          <span
            className={`w-8 shrink-0 text-right tabular-nums ${
              compact ? "text-xs" : "text-sm"
            } font-extrabold text-ink`}
            aria-label={`${STAT_LABELS[key]} ${stats[key]}점`}
          >
            {stats[key]}
          </span>
        </li>
      ))}
    </ul>
  );
}
