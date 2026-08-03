"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ResultLabelBadge } from "@/components/game/ResultLabelBadge";
import { useGame } from "@/hooks/useGame";
import { buildDayReport, decorateAnswers } from "@/features/game/selectors";
import { dayFromIndex } from "@/features/game/gameEngine";
import {
  STAT_ICONS,
  STAT_LABELS,
  STAT_PRIORITY,
  TOTAL_QUESTIONS,
} from "@/features/game/constants";

export default function DayResultPage() {
  const router = useRouter();
  const { ready, save, goNextDay } = useGame();

  useEffect(() => {
    if (!ready) return;
    if (!save || !save.onboardingCompleted) {
      router.replace("/");
      return;
    }
    if (save.status === "completed") {
      router.replace("/ending");
    } else if (save.status === "playing") {
      router.replace("/play");
    }
  }, [ready, save, router]);

  const report = useMemo(() => {
    if (!save || save.status !== "dayResult") return null;
    const day = dayFromIndex(save.currentQuestionIndex);
    return buildDayReport(day, save.dayStartStats, save.stats, save.answers);
  }, [save]);

  if (!ready || !save || save.status !== "dayResult" || !report) {
    return null;
  }

  const isFinalDay = save.currentQuestionIndex >= TOTAL_QUESTIONS - 1;
  const answered = decorateAnswers(report.answers);

  return (
    <AppShell
      header={
        <span className="font-extrabold text-ink">
          🌙 DAY {report.day} 성장 리포트
        </span>
      }
      footer={
        <Button fullWidth onClick={goNextDay}>
          {isFinalDay ? "수습평가 확인하기" : "다음 날 출근하기"}
        </Button>
      }
    >
      <div className="space-y-4 pb-2">
        {/* 오늘의 대표 평가 */}
        <div className="flex flex-col items-center glass-card rounded-3xl p-4 text-center">
          <p className="text-xs font-semibold text-subtle">오늘의 대표 평가</p>
          <div className="mt-2">
            <ResultLabelBadge label={report.analysis.badge} />
          </div>
        </div>

        {/* 오늘 변화량 */}
        <section className="glass-card rounded-3xl p-4">
          <h2 className="mb-3 text-sm font-bold text-ink">오늘의 능력치 변화</h2>
          <ul className="space-y-2">
            {STAT_PRIORITY.map((key) => {
              const start = report.startStats[key];
              const end = report.endStats[key];
              const diff = end - start;
              return (
                <li key={key} className="flex items-center gap-2 text-sm">
                  <span className="flex w-[104px] shrink-0 items-center gap-1 font-medium text-subtle">
                    <span aria-hidden>{STAT_ICONS[key]}</span>
                    {STAT_LABELS[key]}
                  </span>
                  <span className="flex-1 text-right tabular-nums text-subtle">
                    {start} <span aria-hidden>→</span>{" "}
                    <span className="font-semibold text-ink">{end}</span>
                  </span>
                  <span
                    className={`w-12 shrink-0 text-right font-semibold tabular-nums ${
                      diff > 0
                        ? "text-stat-work"
                        : diff < 0
                          ? "text-result-risky"
                          : "text-subtle"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 규칙 기반 분석 */}
        <section className="space-y-2.5">
          <AnalysisCard
            emoji="👍"
            label="잘한 점"
            text={report.analysis.good}
          />
          <AnalysisCard
            emoji="👀"
            label="주의할 점"
            text={report.analysis.watch}
          />
          <AnalysisCard
            emoji="💡"
            label="내일의 팁"
            text={report.analysis.nextTip}
          />
        </section>

        {/* 오늘의 답변 (접힘) */}
        <details className="glass-card rounded-3xl p-4">
          <summary className="cursor-pointer select-none text-sm font-bold text-ink">
            오늘의 답변 다시 보기
          </summary>
          <ul className="mt-3 space-y-3">
            {answered.map(({ question, choiceText, answer }) => (
              <li key={question.id} className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {question.title}
                  </p>
                  <ResultLabelBadge label={answer.resultLabel} size="sm" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-subtle">
                  {choiceText}
                </p>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </AppShell>
  );
}

function AnalysisCard({
  emoji,
  label,
  text,
}: {
  emoji: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 glass-card rounded-2xl p-3.5">
      <span aria-hidden className="text-xl">
        {emoji}
      </span>
      <div>
        <p className="text-xs font-semibold text-subtle">{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink">{text}</p>
      </div>
    </div>
  );
}
