import type { Choice } from "@/types/game";

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  /** 선택이 이미 이뤄졌는지 (전체 잠금) */
  locked: boolean;
  /** 이 선택지가 선택된 답인지 */
  selected: boolean;
  onSelect: (choiceId: string) => void;
}

const LABELS = ["A", "B", "C", "D"];

/** 답변 선택지 버튼. 원문 전체가 보이는 세로 버튼 (기획서 4.4). */
export function ChoiceButton({
  choice,
  index,
  locked,
  selected,
  onSelect,
}: ChoiceButtonProps) {
  const base =
    "flex w-full items-start gap-2.5 rounded-2xl border-2 p-3.5 text-left text-[15px] font-medium leading-relaxed transition-all active:scale-[0.99]";

  const state = selected
    ? "border-brand bg-brand-soft text-ink shadow-glossy"
    : locked
      ? "border-transparent bg-white/60 text-subtle opacity-60"
      : "border-white bg-white/80 text-ink shadow-card hover:border-brand/60 hover:bg-brand-soft/50";

  return (
    <button
      type="button"
      className={`${base} ${state}`}
      onClick={() => onSelect(choice.id)}
      disabled={locked}
      aria-pressed={selected}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          selected
            ? "bg-brand-gradient text-white"
            : "bg-grape-soft text-grape"
        }`}
      >
        {LABELS[index]}
      </span>
      <span className="min-w-0 flex-1">{choice.text}</span>
    </button>
  );
}
