import type { ResultLabel } from "@/types/game";
import { RESULT_EMOJI, RESULT_LABELS } from "@/features/game/constants";

const STYLES: Record<ResultLabel, string> = {
  great: "bg-brand-gradient text-white shadow-glossy",
  safe: "bg-sky text-white",
  risky: "bg-stat-mental text-white",
};

/** 4단계 결과 라벨 배지. "정답/오답" 대신 사용. */
export function ResultLabelBadge({
  label,
  size = "md",
}: {
  label: ResultLabel;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold ${
        STYLES[label]
      } ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1.5 text-sm"}`}
    >
      <span aria-hidden>{RESULT_EMOJI[label]}</span>
      {RESULT_LABELS[label]}
    </span>
  );
}
