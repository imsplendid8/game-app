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

const VALID_LABELS: ResultLabel[] = ["great", "safe", "risky"];
const CHOICES_PER_QUESTION = 3;

describe("문제 데이터 무결성 (10문제 / 하루 2문제 / 선택지 3개)", () => {
  it(`총 ${TOTAL_QUESTIONS}개 문제가 있다`, () => {
    expect(QUESTIONS).toHaveLength(TOTAL_QUESTIONS);
  });

  it("order는 1~10으로 중복 없이 채워진다", () => {
    const orders = QUESTIONS.map((q) => q.order).sort((a, b) => a - b);
    expect(orders).toEqual(
      Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1),
    );
  });

  it("id는 모두 고유하다", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(TOTAL_QUESTIONS);
  });

  it("day는 1~5이며 각 일차마다 2문제씩이다", () => {
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const inDay = QUESTIONS.filter((q) => q.day === day);
      expect(inDay).toHaveLength(QUESTIONS_PER_DAY);
    }
  });

  it("각 문제는 정확히 3개의 선택지를 가진다", () => {
    for (const q of QUESTIONS) {
      expect(q.choices).toHaveLength(CHOICES_PER_QUESTION);
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

  it("결과 라벨은 센스/무난/아찔(great/safe/risky) 중 하나다", () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        expect(VALID_LABELS).toContain(c.resultLabel);
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

  it("모든 변화량이 0인 선택은 없다", () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        const nonZero = STAT_KEYS.filter((k) => c.statChanges[k] !== 0);
        expect(nonZero.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("각 문제에는 최소 하나의 센스(great) 선택지가 있다", () => {
    for (const q of QUESTIONS) {
      const hasGreat = q.choices.some((c) => c.resultLabel === "great");
      expect(hasGreat, `${q.id} has no great choice`).toBe(true);
    }
  });
});
