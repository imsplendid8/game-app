import type { Choice } from "@/types/game";
import { ResultLabelBadge } from "./ResultLabelBadge";
import { StatChangeChips } from "./StatChangeChips";

/** 선택 후 결과 패널: 라벨, 회사어 해석, 상대 반응, 팁, 변화 칩 (기획서 4.4). */
export function ResultPanel({ choice }: { choice: Choice }) {
  return (
    <section
      aria-label="선택 결과"
      className="glass-card animate-pop rounded-3xl p-4"
    >
      <ResultLabelBadge label={choice.resultLabel} />

      <dl className="mt-3 space-y-3">
        <div>
          <dt className="text-xs font-bold text-grape">💡 회사어 해석</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-ink">
            {choice.interpretation}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-brand-deep">🗨️ 상대 반응</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-ink">
            {choice.reaction}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-sky">✨ 한 줄 팁</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-ink">
            {choice.tip}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-xs font-bold text-subtle">능력치 변화</p>
        <StatChangeChips changes={choice.statChanges} />
      </div>
    </section>
  );
}
