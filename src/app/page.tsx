"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { useGame } from "@/hooks/useGame";

export default function StartPage() {
  const { ready, recovered, saveState, newGame, resume } = useGame();
  const [confirmNew, setConfirmNew] = useState(false);

  function handleNewGame() {
    if (saveState === "none") {
      newGame();
    } else {
      setConfirmNew(true);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-between px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-4 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-grape shadow-card backdrop-blur">
          🌸 회사생활 육성 시뮬레이션
        </p>

        <CharacterAvatar emoji="🧑‍💼" size="lg" />

        <h1 className="mt-5 text-[26px] font-extrabold leading-tight">
          <span className="text-gradient">신입사원 김넵</span>
          <br />
          <span className="text-ink">키우기</span>
        </h1>
        <p className="mt-2.5 text-sm font-medium leading-relaxed text-subtle">
          회사어를 해석하고
          <br />
          무사히 수습을 통과시켜 주세요!
        </p>
        <p className="mt-4 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-bold text-brand-deep shadow-card backdrop-blur">
          ⏱ 약 5분 · 총 15문제
        </p>
      </div>

      <div className="space-y-2.5">
        {ready && saveState === "none" && (
          <Button fullWidth onClick={newGame}>
            게임 시작 💖
          </Button>
        )}

        {ready && saveState === "in-progress" && (
          <>
            <Button fullWidth onClick={resume}>
              이어하기 ▶
            </Button>
            <Button variant="secondary" fullWidth onClick={handleNewGame}>
              새 게임
            </Button>
          </>
        )}

        {ready && saveState === "completed" && (
          <>
            <Button fullWidth onClick={resume}>
              결과 다시 보기 🏆
            </Button>
            <Button variant="secondary" fullWidth onClick={handleNewGame}>
              새 게임
            </Button>
          </>
        )}

        <p className="pt-3 text-center text-[11px] leading-relaxed text-subtle">
          모든 상황과 인물은 가상이며, 해석은 맥락에 따라 달라질 수 있습니다.
        </p>
      </div>

      <ConfirmModal
        open={confirmNew}
        title="새 게임을 시작할까요?"
        description="지금까지의 진행이 모두 사라지고 처음부터 다시 시작합니다."
        confirmLabel="새로 시작"
        cancelLabel="취소"
        onConfirm={() => {
          setConfirmNew(false);
          newGame();
        }}
        onCancel={() => setConfirmNew(false)}
      />

      <Toast
        show={ready && recovered}
        message="저장된 진행을 불러오지 못해 새 게임으로 시작합니다."
      />
    </div>
  );
}
