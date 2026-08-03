import { describe, expect, it } from "vitest";
import {
  applyStatChanges,
  calcOverallScore,
  clampStat,
  createInitialStats,
  dayFromIndex,
  findStrongestStat,
  findWeakestStat,
  isLastQuestionOfDay,
  positionInDay,
  statWithMaxChange,
  statWithMinChange,
} from "./gameEngine";
import type { Stats } from "@/types/game";

describe("clampStat", () => {
  it("0 미만은 0으로 제한한다", () => {
    expect(clampStat(-5)).toBe(0);
  });
  it("100 초과는 100으로 제한한다", () => {
    expect(clampStat(120)).toBe(100);
  });
  it("범위 안 값은 그대로 둔다", () => {
    expect(clampStat(50)).toBe(50);
  });
});

describe("applyStatChanges", () => {
  it("변화량을 더하고 0~100으로 제한한다", () => {
    const stats = createInitialStats();
    const next = applyStatChanges(stats, {
      sense: 10,
      work: -60,
      mental: 0,
      favor: 60,
      leaveChance: 0,
    });
    expect(next.sense).toBe(60);
    expect(next.work).toBe(0); // 50-60 -> 0
    expect(next.favor).toBe(100); // 50+60 -> 100 (clamp)
    expect(next.mental).toBe(50);
  });

  it("원본을 변경하지 않는다", () => {
    const stats = createInitialStats();
    applyStatChanges(stats, {
      sense: 10,
      work: 0,
      mental: 0,
      favor: 0,
      leaveChance: 0,
    });
    expect(stats.sense).toBe(50);
  });
});

describe("calcOverallScore", () => {
  it("다섯 능력치의 평균을 반올림한다", () => {
    const stats: Stats = {
      sense: 70,
      work: 60,
      mental: 50,
      favor: 80,
      leaveChance: 41,
    };
    // 합 301 / 5 = 60.2 -> 60
    expect(calcOverallScore(stats)).toBe(60);
  });
});

describe("동점 우선순위", () => {
  it("가장 높은 능력치가 동점이면 우선순위(눈치>업무>...)로 고른다", () => {
    const stats: Stats = {
      sense: 70,
      work: 70,
      mental: 40,
      favor: 40,
      leaveChance: 40,
    };
    expect(findStrongestStat(stats)).toBe("sense");
  });

  it("가장 낮은 능력치가 동점이면 우선순위로 고른다", () => {
    const stats: Stats = {
      sense: 30,
      work: 30,
      mental: 80,
      favor: 80,
      leaveChance: 80,
    };
    expect(findWeakestStat(stats)).toBe("sense");
  });

  it("변화량 최대/최소도 동점 시 우선순위를 따른다", () => {
    const changes = {
      sense: 5,
      work: 5,
      mental: -3,
      favor: -3,
      leaveChance: 0,
    };
    expect(statWithMaxChange(changes)).toBe("sense");
    expect(statWithMinChange(changes)).toBe("mental");
  });
});

describe("일차/위치 계산", () => {
  it("인덱스로 일차를 계산한다", () => {
    expect(dayFromIndex(0)).toBe(1);
    expect(dayFromIndex(2)).toBe(1);
    expect(dayFromIndex(3)).toBe(2);
    expect(dayFromIndex(14)).toBe(5);
  });
  it("하루 안 위치를 계산한다", () => {
    expect(positionInDay(0)).toBe(1);
    expect(positionInDay(2)).toBe(3);
    expect(positionInDay(3)).toBe(1);
  });
  it("하루의 마지막 문제를 판별한다", () => {
    expect(isLastQuestionOfDay(2)).toBe(true);
    expect(isLastQuestionOfDay(0)).toBe(false);
    expect(isLastQuestionOfDay(14)).toBe(true);
  });
});
