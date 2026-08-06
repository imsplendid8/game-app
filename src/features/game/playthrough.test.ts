import { describe, expect, it } from "vitest";
import { QUESTIONS_IN_ORDER } from "@/data/questions";
import type { AnswerRecord, Choice, ResultLabel, Stats } from "@/types/game";
import { applyStatChanges, createInitialStats } from "./gameEngine";
import { resolveEnding } from "./endingResolver";

/** 선택 전략에 따라 전체 문제를 끝까지 진행한 결과. */
function simulate(pick: (choices: Choice[]) => Choice): {
  stats: Stats;
  answers: AnswerRecord[];
} {
  let stats = createInitialStats();
  const answers: AnswerRecord[] = [];
  for (const q of QUESTIONS_IN_ORDER) {
    const choice = pick(q.choices);
    stats = applyStatChanges(stats, choice.statChanges);
    answers.push({
      questionId: q.id,
      choiceId: choice.id,
      resultLabel: choice.resultLabel,
      appliedChanges: choice.statChanges,
    });
  }
  return { stats, answers };
}

function byLabel(label: ResultLabel) {
  return (choices: Choice[]): Choice =>
    choices.find((c) => c.resultLabel === label) ?? choices[0];
}

describe("전체 플레이 시뮬레이션", () => {
  it("항상 great를 고르면 에이스 엔딩에 도달한다", () => {
    const { stats, answers } = simulate(byLabel("great"));
    expect(resolveEnding(stats, answers)).toBe("ending-ace");
  });

  it("항상 risky를 고르면 생존자 엔딩에 도달한다", () => {
    const { answers, stats } = simulate(byLabel("risky"));
    expect(resolveEnding(stats, answers)).toBe("ending-survival");
  });

  it("항상 safe를 고르면 능력치가 완만히 오른다", () => {
    const { stats } = simulate(byLabel("safe"));
    // safe는 총 변화량이 +이므로 시작(50)보다 높거나 같아야 한다.
    expect(stats.work).toBeGreaterThanOrEqual(50);
  });

  it("어떤 전략에서도 모든 능력치가 0~100 범위를 벗어나지 않는다", () => {
    const strategies: ResultLabel[] = ["great", "safe", "risky"];
    for (const label of strategies) {
      const { stats } = simulate(byLabel(label));
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("네 엔딩 중 ace·survival과 중간 엔딩이 도달 가능하다", () => {
    const reached = new Set<string>();
    const great = simulate(byLabel("great"));
    reached.add(resolveEnding(great.stats, great.answers));
    const risky = simulate(byLabel("risky"));
    reached.add(resolveEnding(risky.stats, risky.answers));

    // 무난 위주 플레이는 중간 엔딩(믿는 신입 또는 마이웨이)에 도달한다.
    const moderate = simulate(byLabel("safe"));
    reached.add(resolveEnding(moderate.stats, moderate.answers));

    expect(reached.has("ending-ace")).toBe(true);
    expect(reached.has("ending-survival")).toBe(true);
    // ace/survival이 아닌 중간 엔딩도 최소 하나 나와야 한다.
    expect(
      reached.has("ending-trusted") || reached.has("ending-my-pace"),
    ).toBe(true);
  });
});
