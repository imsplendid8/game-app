import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import type { ResultLabel, StatKey } from "@/types/game";
import {
  QUESTIONS_PER_DAY,
  TOTAL_DAYS,
  TOTAL_QUESTIONS,
} from "@/features/game/constants";

const STAT_KEYS: StatKey[] = [
  "sense",
  "work",
  "mental",
  "favor",
  "leaveChance",
];

// 결과 라벨별 권장 총 변화량 범위 (기획서 6.2)
const TOTAL_RANGE: Record<ResultLabel, [number, number]> = {
  great: [10, 18],
  safe: [3, 9],
  awkward: [-3, 2],
  risky: [-12, -4],
};

describe("문제 데이터 무결성", () => {
  it(`총 ${TOTAL_QUESTIONS}개 문제가 있다`, () => {
    expect(QUESTIONS).toHaveLength(TOTAL_QUESTIONS);
  });

  it("order는 1~15로 중복 없이 채워진다", () => {
    const orders = QUESTIONS.map((q) => q.order).sort((a, b) => a - b);
    expect(orders).toEqual(
      Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1),
    );
  });

  it("id는 모두 고유하다", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(TOTAL_QUESTIONS);
  });

  it("day는 1~5이며 각 일차마다 3문제씩이다", () => {
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const inDay = QUESTIONS.filter((q) => q.day === day);
      expect(inDay).toHaveLength(QUESTIONS_PER_DAY);
    }
  });

  it("각 문제는 3~4개의 선택지를 가진다", () => {
    for (const q of QUESTIONS) {
      expect(q.choices.length).toBeGreaterThanOrEqual(3);
      expect(q.choices.length).toBeLessThanOrEqual(4);
    }
  });

  it("문제 안 선택지 id는 고유하다", () => {
    for (const q of QUESTIONS) {
      const ids = new Set(q.choices.map((c) => c.id));
      expect(ids.size).toBe(q.choices.length);
    }
  });

  it("필수 텍스트 필드가 비어 있지 않다", () => {
    for (const q of QUESTIONS) {
      expect(q.title.trim()).not.toBe("");
      expect(q.context.trim()).not.toBe("");
      expect(q.senderRole.trim()).not.toBe("");
      expect(q.message.trim()).not.toBe("");
      expect(q.prompt.trim()).not.toBe("");
      for (const c of q.choices) {
        expect(c.text.trim()).not.toBe("");
        expect(c.interpretation.trim()).not.toBe("");
        expect(c.reaction.trim()).not.toBe("");
        expect(c.tip.trim()).not.toBe("");
      }
    }
  });

  it("모든 변화량은 정수이며 -10~+10 범위다", () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        for (const key of STAT_KEYS) {
          const v = c.statChanges[key];
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(-10);
          expect(v).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it("변경되는 능력치는 2~4개이며 전부 0인 선택은 없다", () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        const nonZero = STAT_KEYS.filter((k) => c.statChanges[k] !== 0);
        expect(nonZero.length).toBeGreaterThanOrEqual(2);
        expect(nonZero.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it("결과 라벨과 총 변화량 범위가 일치한다", () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        const total = STAT_KEYS.reduce(
          (sum, k) => sum + c.statChanges[k],
          0,
        );
        const [min, max] = TOTAL_RANGE[c.resultLabel];
        expect(
          total,
          `${q.id}/${c.id} (${c.resultLabel}) total=${total}`,
        ).toBeGreaterThanOrEqual(min);
        expect(
          total,
          `${q.id}/${c.id} (${c.resultLabel}) total=${total}`,
        ).toBeLessThanOrEqual(max);
      }
    }
  });

  it("각 문제에는 최소 하나의 great 선택지가 있다", () => {
    for (const q of QUESTIONS) {
      const hasGreat = q.choices.some((c) => c.resultLabel === "great");
      expect(hasGreat, `${q.id} has no great choice`).toBe(true);
    }
  });
});
