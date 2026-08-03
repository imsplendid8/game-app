import { describe, expect, it } from "vitest";
import { resolveEnding } from "./endingResolver";
import type { AnswerRecord, ResultLabel, Stats } from "@/types/game";

function stats(partial: Partial<Stats>): Stats {
  return {
    sense: 50,
    work: 50,
    mental: 50,
    favor: 50,
    leaveChance: 50,
    ...partial,
  };
}

function answers(labels: ResultLabel[]): AnswerRecord[] {
  return labels.map((label, i) => ({
    questionId: `q${i}`,
    choiceId: "a",
    resultLabel: label,
    appliedChanges: { sense: 0, work: 0, mental: 0, favor: 0, leaveChance: 0 },
  }));
}

describe("resolveEnding — 우선순위 (기획서 8장)", () => {
  it("능력치가 하나라도 25 이하면 생존자 (다른 조건 무시)", () => {
    const s = stats({ sense: 25, work: 90, favor: 90, mental: 90, leaveChance: 90 });
    expect(resolveEnding(s, [])).toBe("ending-survival");
  });

  it("위험 대응 5회 이상이면 생존자 (능력치가 높아도)", () => {
    const s = stats({ sense: 80, work: 80, favor: 80, mental: 80, leaveChance: 80 });
    const a = answers(["risky", "risky", "risky", "risky", "risky"]);
    expect(resolveEnding(s, a)).toBe("ending-survival");
  });

  it("위험 대응 4회는 생존자 조건이 아니다", () => {
    const s = stats({ sense: 80, work: 80, favor: 80, mental: 80, leaveChance: 80 });
    const a = answers(["risky", "risky", "risky", "risky"]);
    expect(resolveEnding(s, a)).toBe("ending-ace");
  });

  it("종합75+·눈치70+·업무70+·모두50+ 이면 에이스", () => {
    const s = stats({
      sense: 70,
      work: 80,
      mental: 80,
      favor: 80,
      leaveChance: 67,
    });
    // 합 377 / 5 = 75.4 -> 75
    expect(resolveEnding(s, [])).toBe("ending-ace");
  });

  it("눈치가 70 미만이면 에이스가 아니다 (업무70+ → 믿는 신입)", () => {
    const s = stats({
      sense: 69,
      work: 80,
      mental: 80,
      favor: 80,
      leaveChance: 80,
    });
    expect(resolveEnding(s, [])).toBe("ending-trusted");
  });

  it("업무 70 이상이면 믿는 신입", () => {
    const s = stats({ work: 70 });
    expect(resolveEnding(s, [])).toBe("ending-trusted");
  });

  it("상사 호감도 70 이상이면 믿는 신입", () => {
    const s = stats({ favor: 70 });
    expect(resolveEnding(s, [])).toBe("ending-trusted");
  });

  it("어느 조건에도 안 맞으면 마이웨이", () => {
    const s = stats({ sense: 55, work: 55, mental: 55, favor: 55, leaveChance: 55 });
    expect(resolveEnding(s, [])).toBe("ending-my-pace");
  });

  it("모두 50이면 마이웨이", () => {
    expect(resolveEnding(stats({}), [])).toBe("ending-my-pace");
  });
});
