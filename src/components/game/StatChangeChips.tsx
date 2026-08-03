import type { StatChanges, StatKey } from "@/types/game";
import { STAT_ICONS, STAT_LABELS, STAT_PRIORITY } from "@/features/game/constants";

/** 0이 아닌 능력치 변화만 칩으로 표시 (기획서 4.4). */
export function StatChangeChips({ changes }: { changes: StatChanges }) {
  const nonZero = STAT_PRIORITY.filter((key) => changes[key] !== 0);

  if (nonZero.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {nonZero.map((key: StatKey) => {
        const value = changes[key];
        const positive = value > 0;
        return (
          <li
            key={key}
            className={`inline-flex animate-pop items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
              positive
                ? "bg-brand-soft text-brand-deep"
                : "bg-line text-subtle"
            }`}
          >
            <span aria-hidden>{STAT_ICONS[key]}</span>
            {STAT_LABELS[key]} {positive ? "+" : ""}
            {value}
          </li>
        );
      })}
    </ul>
  );
}
