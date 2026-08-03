"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { useGame } from "@/hooks/useGame";
import {
  STAT_DESCRIPTIONS,
  STAT_ICONS,
  STAT_LABELS,
  STAT_PRIORITY,
} from "@/features/game/constants";

const TOTAL_CARDS = 3;

export default function HowToPlayPage() {
  const { completeOnboarding } = useGame();
  const [card, setCard] = useState(0);

  const isLast = card === TOTAL_CARDS - 1;

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-ink">🌟 게임 방법</span>
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-bold text-grape">
            {card + 1} / {TOTAL_CARDS}
          </span>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setCard((c) => Math.max(0, c - 1))}
            disabled={card === 0}
          >
            이전
          </Button>
          {isLast ? (
            <Button fullWidth onClick={completeOnboarding}>
              출근하기
            </Button>
          ) : (
            <Button fullWidth onClick={() => setCard((c) => c + 1)}>
              다음
            </Button>
          )}
        </div>
      }
    >
      {card === 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <span aria-hidden className="text-6xl">
            💬
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">
            메시지를 읽고 답변을 골라요
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-subtle">
            선배와 팀 리더가 보내는 애매한 회사어 메시지. 그 속뜻을 읽고 가장
            어울리는 답변을 골라 보세요. 정답을 외우는 게임이 아니라, 상황과
            관계에 따라 말의 온도를 맞추는 게임이에요.
          </p>
        </div>
      )}

      {card === 1 && (
        <div className="py-4">
          <h2 className="text-center text-xl font-bold text-ink">
            5가지 능력치가 자라요
          </h2>
          <p className="mt-2 text-center text-sm text-subtle">
            선택마다 능력치가 오르내려요. 모두 50에서 시작합니다.
          </p>
          <ul className="mt-5 space-y-3">
            {STAT_PRIORITY.map((key) => (
              <li
                key={key}
                className="glass-card flex items-start gap-3 rounded-2xl p-3.5"
              >
                <span aria-hidden className="text-2xl">
                  {STAT_ICONS[key]}
                </span>
                <div>
                  <p className="font-semibold text-ink">{STAT_LABELS[key]}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-subtle">
                    {STAT_DESCRIPTIONS[key]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {card === 2 && (
        <div className="flex flex-col items-center py-6 text-center">
          <span aria-hidden className="text-6xl">
            📅
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">
            5일간의 수습 기간
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-subtle">
            하루에 3개씩, 5일 동안 총 15개의 상황에 답해요. 하루가 끝날 때마다
            그날의 대응을 돌아보는 리포트를 받고, 마지막 날에는 수습평가로 4개
            엔딩 중 하나를 만나게 됩니다.
          </p>
          <p className="mt-4 text-sm font-medium text-brand">
            이제, 출근할 시간이에요!
          </p>
        </div>
      )}
    </AppShell>
  );
}
