"use client";

// 화면과 게임 상태를 연결하는 훅. 저장의 단일 진입점.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Choice, Question, SaveData } from "@/types/game";
import { QUESTIONS_IN_ORDER } from "@/data/questions";
import { clearSave, loadSave, writeSave } from "@/features/game/storage";
import {
  createInitialStats,
  dayFromIndex,
  isLastQuestionOfDay,
  statsFromAnswers,
} from "@/features/game/gameEngine";
import { resolveEnding } from "@/features/game/endingResolver";
import { SAVE_VERSION, TOTAL_QUESTIONS } from "@/features/game/constants";

function createNewSave(): SaveData {
  const stats = createInitialStats();
  return {
    version: SAVE_VERSION,
    status: "playing",
    onboardingCompleted: false,
    currentQuestionIndex: 0,
    stats,
    dayStartStats: { ...stats },
    answers: [],
    selectedChoiceId: null,
    endingId: null,
    updatedAt: new Date().toISOString(),
  };
}

export interface UseGame {
  /** 클라이언트에서 저장을 읽어 초기화가 끝났는지 */
  ready: boolean;
  /** 손상된 저장을 삭제하고 새로 시작했는지 (토스트 표시용) */
  recovered: boolean;
  /** 현재 저장 데이터. 저장이 없으면 null */
  save: SaveData | null;
  /** 현재 문제 (playing/dayResult 상태에서 유효) */
  currentQuestion: Question | null;
  /** 현재 선택한 선택지 (선택 후 결과 패널 복원용) */
  selectedChoice: Choice | null;
  /** 시작 화면에서 표시할 상태 */
  saveState: "none" | "in-progress" | "completed";
  newGame: () => void;
  completeOnboarding: () => void;
  selectChoice: (choiceId: string) => void;
  goNext: () => void;
  goNextDay: () => void;
  restart: () => void;
  /** 저장 상태에 맞는 화면으로 이동(이어하기) */
  resume: () => void;
}

export function useGame(): UseGame {
  const router = useRouter();
  const [save, setSave] = useState<SaveData | null>(null);
  const [ready, setReady] = useState(false);
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    const result = loadSave();
    setSave(result.save);
    setRecovered(result.recovered);
    setReady(true);
  }, []);

  /** 저장 데이터를 갱신하고 즉시 영속화한다. */
  const persist = useCallback((next: SaveData) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setSave(stamped);
    writeSave(stamped);
    return stamped;
  }, []);

  const newGame = useCallback(() => {
    clearSave();
    persist(createNewSave());
    router.push("/how-to-play");
  }, [persist, router]);

  const completeOnboarding = useCallback(() => {
    const base = save ?? createNewSave();
    persist({
      ...base,
      onboardingCompleted: true,
      status: "playing",
    });
    router.push("/play");
  }, [save, persist, router]);

  const selectChoice = useCallback(
    (choiceId: string) => {
      if (!save || save.status !== "playing") return;

      const question = QUESTIONS_IN_ORDER[save.currentQuestionIndex];
      if (!question) return;
      const choice = question.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      // 같은 선택이면 무시 (불필요한 저장 방지)
      if (save.selectedChoiceId === choiceId) return;

      // 현재 문제의 기존 답변을 제거하고 새 답변으로 교체 → 선택 변경 허용.
      // (다음 문제로 넘어가기 전까지 언제든 다른 선택지로 바꿀 수 있다.)
      const withoutCurrent = save.answers.filter(
        (a) => a.questionId !== question.id,
      );
      const nextAnswers = [
        ...withoutCurrent,
        {
          questionId: question.id,
          choiceId: choice.id,
          resultLabel: choice.resultLabel,
          appliedChanges: choice.statChanges,
        },
      ];
      // 초기값부터 전체 답변을 다시 접어 능력치를 정확히 재계산(클램프 손실 방지).
      const nextStats = statsFromAnswers(nextAnswers);

      persist({
        ...save,
        stats: nextStats,
        selectedChoiceId: choiceId,
        answers: nextAnswers,
      });
    },
    [save, persist],
  );

  const goNext = useCallback(() => {
    if (!save || save.status !== "playing" || !save.selectedChoiceId) return;
    const index = save.currentQuestionIndex;

    if (isLastQuestionOfDay(index)) {
      persist({ ...save, status: "dayResult" });
      router.push("/day-result");
      return;
    }

    persist({
      ...save,
      currentQuestionIndex: index + 1,
      selectedChoiceId: null,
    });
  }, [save, persist, router]);

  const goNextDay = useCallback(() => {
    if (!save || save.status !== "dayResult") return;
    const index = save.currentQuestionIndex;

    // 마지막 문제(15번, index 14)를 마쳤다면 엔딩으로.
    if (index >= TOTAL_QUESTIONS - 1) {
      const endingId = resolveEnding(save.stats, save.answers);
      persist({ ...save, status: "completed", endingId });
      router.push("/ending");
      return;
    }

    persist({
      ...save,
      currentQuestionIndex: index + 1,
      selectedChoiceId: null,
      dayStartStats: { ...save.stats },
      status: "playing",
    });
    router.push("/play");
  }, [save, persist, router]);

  const restart = useCallback(() => {
    clearSave();
    setSave(null);
    router.push("/");
  }, [router]);

  const resume = useCallback(() => {
    if (!save) return;
    if (!save.onboardingCompleted) {
      router.push("/how-to-play");
      return;
    }
    if (save.status === "completed") {
      router.push("/ending");
    } else if (save.status === "dayResult") {
      router.push("/day-result");
    } else {
      router.push("/play");
    }
  }, [save, router]);

  const currentQuestion =
    save && save.currentQuestionIndex < TOTAL_QUESTIONS
      ? QUESTIONS_IN_ORDER[save.currentQuestionIndex]
      : null;

  const selectedChoice =
    save && save.selectedChoiceId && currentQuestion
      ? currentQuestion.choices.find((c) => c.id === save.selectedChoiceId) ??
        null
      : null;

  const saveState: UseGame["saveState"] = !save
    ? "none"
    : save.status === "completed"
      ? "completed"
      : "in-progress";

  return {
    ready,
    recovered,
    save,
    currentQuestion,
    selectedChoice,
    saveState,
    newGame,
    completeOnboarding,
    selectChoice,
    goNext,
    goNextDay,
    restart,
    resume,
  };
}

export { dayFromIndex };
