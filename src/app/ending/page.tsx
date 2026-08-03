"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatBars } from "@/components/game/StatBars";
import { ResultLabelBadge } from "@/components/game/ResultLabelBadge";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { useGame } from "@/hooks/useGame";
import { buildFinalReport } from "@/features/game/selectors";
import { STAT_ICONS, STAT_LABELS } from "@/features/game/constants";
import type { ResultLabel } from "@/types/game";

const SUMMARY_ORDER: ResultLabel[] = ["great", "safe", "awkward", "risky"];

export default function EndingPage() {
  const router = useRouter();
  const { ready, save, restart } = useGame();
  const [confirmRestart, setConfirmRestart] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!save || save.status !== "completed") {
      router.replace("/");
    }
  }, [ready, save, router]);

  const report = useMemo(() => {
    if (!save || save.status !== "completed") return null;
    return buildFinalReport(save.stats, save.answers);
  }, [save]);

  if (!ready || !save || save.status !== "completed" || !report) {
    return null;
  }

  const { ending, stats, overallScore, strongest, weakest, summary } = report;

  return (
    <AppShell
      header={<span className="font-extrabold text-ink">🎀 수습평가 결과</span>}
      footer={
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setConfirmRestart(true)}
        >
          처음부터 다시 하기
        </Button>
      }
    >
      <div className="space-y-4 pb-2">
        {/* 엔딩 히어로 */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-center shadow-glossy">
          <span
            aria-hidden
            className="absolute left-4 top-3 animate-twinkle text-lg"
          >
            ✨
          </span>
          <span
            aria-hidden
            className="absolute right-5 top-6 animate-twinkle text-sm [animation-delay:0.8s]"
          >
            ⭐
          </span>
          <div className="flex flex-col items-center">
            <CharacterAvatar emoji={ending.emoji} size="md" stage={false} />
            <p className="mt-3 rounded-full bg-white/30 px-3 py-0.5 text-xs font-extrabold text-white">
              {ending.grade} 등급
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-white drop-shadow">
              {ending.title}
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/95">
              {ending.story}
            </p>
          </div>
        </div>

        {/* 종합점수 */}
        <div className="flex items-center justify-between glass-card rounded-3xl p-4">
          <span className="text-sm font-semibold text-subtle">종합점수</span>
          <span className="text-2xl font-extrabold tabular-nums text-brand">
            {overallScore}
            <span className="text-base text-subtle">/100</span>
          </span>
        </div>

        {/* 최종 능력치 */}
        <section className="glass-card rounded-3xl p-4">
          <h2 className="mb-3 text-sm font-bold text-ink">최종 능력치</h2>
          <StatBars stats={stats} />
        </section>

        {/* 강점 / 성장 포인트 */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-card rounded-2xl p-3.5">
            <p className="text-xs font-semibold text-subtle">강점</p>
            <p className="mt-1 flex items-center gap-1 font-bold text-ink">
              <span aria-hidden>{STAT_ICONS[strongest]}</span>
              {STAT_LABELS[strongest]}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-3.5">
            <p className="text-xs font-semibold text-subtle">성장 포인트</p>
            <p className="mt-1 flex items-center gap-1 font-bold text-ink">
              <span aria-hidden>{STAT_ICONS[weakest]}</span>
              {STAT_LABELS[weakest]}
            </p>
          </div>
        </div>

        {/* 플레이 요약 */}
        <section className="glass-card rounded-3xl p-4">
          <h2 className="mb-3 text-sm font-bold text-ink">플레이 요약</h2>
          <ul className="flex flex-wrap gap-2">
            {SUMMARY_ORDER.map((label) => (
              <li key={label} className="flex items-center gap-1.5">
                <ResultLabelBadge label={label} size="sm" />
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {summary[label]}회
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ConfirmModal
        open={confirmRestart}
        title="처음부터 다시 할까요?"
        description="현재 결과가 사라지고 새 게임으로 시작합니다."
        confirmLabel="다시 하기"
        cancelLabel="취소"
        onConfirm={() => {
          setConfirmRestart(false);
          restart();
        }}
        onCancel={() => setConfirmRestart(false)}
      />
    </AppShell>
  );
}
