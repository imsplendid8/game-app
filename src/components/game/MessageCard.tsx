import type { Question } from "@/types/game";

/** 메신저 상황 카드: 발신자, 시각, 상황 설명, 말풍선 (기획서 4.4). */
export function MessageCard({ question }: { question: Question }) {
  return (
    <div className="glass-card rounded-3xl p-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-lg shadow-glossy"
        >
          💬
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">
            {question.senderRole}
          </p>
          <p className="text-xs text-subtle">{question.sentAt}</p>
        </div>
      </div>

      {question.context && (
        <p className="mt-3 rounded-2xl bg-grape-soft/70 px-3 py-2 text-xs leading-relaxed text-subtle">
          {question.context}
        </p>
      )}

      <div className="mt-2.5 rounded-3xl rounded-tl-md bg-brand-soft px-4 py-3">
        <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-ink">
          {question.message}
        </p>
      </div>
    </div>
  );
}
