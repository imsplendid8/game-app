"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { MessageCard } from "@/components/game/MessageCard";
import { ChoiceButton } from "@/components/game/ChoiceButton";
import { ResultPanel } from "@/components/game/ResultPanel";
import { ProgressBar } from "@/components/game/ProgressBar";
import { StatBars } from "@/components/game/StatBars";
import { useGame } from "@/hooks/useGame";
import {
  dayFromIndex,
  isLastQuestionOfDay,
} from "@/features/game/gameEngine";
import { TOTAL_QUESTIONS } from "@/features/game/constants";

export default function PlayPage() {
  const router = useRouter();
  const {
    ready,
    save,
    currentQuestion,
    selectedChoice,
    selectChoice,
    goNext,
  } = useGame();

  // 단일 게임 경로 보호: 플레이 상태가 아니면 알맞은 곳으로 보낸다.
  useEffect(() => {
    if (!ready) return;
    if (!save || !save.onboardingCompleted) {
      router.replace("/");
      return;
    }
    if (save.status === "completed") {
      router.replace("/ending");
    } else if (save.status === "dayResult") {
      router.replace("/day-result");
    }
  }, [ready, save, router]);

  if (!ready || !save || save.status !== "playing" || !currentQuestion) {
    return null;
  }

  const index = save.currentQuestionIndex;
  const day = dayFromIndex(index);
  const answered = Boolean(save.selectedChoiceId);
  const lastOfDay = isLastQuestionOfDay(index);

  return (
    <AppShell
      header={
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="rounded-full bg-brand-gradient px-3 py-0.5 text-white shadow-glossy">
              DAY {day}
            </span>
            <span className="text-subtle">
              {index + 1} / {TOTAL_QUESTIONS}
            </span>
          </div>
          <ProgressBar current={index + 1} total={TOTAL_QUESTIONS} />
        </div>
      }
      footer={
        answered ? (
          <Button fullWidth onClick={goNext}>
            {lastOfDay ? "오늘 업무 마치기" : "다음 메시지"}
          </Button>
        ) : null
      }
    >
      <div className="space-y-4 pb-2">
        <div className="glass-card rounded-3xl p-3.5">
          <StatBars stats={save.stats} compact />
        </div>

        <MessageCard question={currentQuestion} />

        <p className="px-1 text-lg font-extrabold text-ink">
          {currentQuestion.prompt}
        </p>

        <div className="space-y-2">
          {currentQuestion.choices.map((choice, i) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              index={i}
              locked={false}
              selected={save.selectedChoiceId === choice.id}
              onSelect={selectChoice}
            />
          ))}
        </div>

        {answered && (
          <p className="px-1 text-center text-xs font-medium text-subtle">
            💡 다른 선택지를 눌러 답을 바꿀 수 있어요.
          </p>
        )}

        {selectedChoice && <ResultPanel choice={selectedChoice} />}
      </div>
    </AppShell>
  );
}
