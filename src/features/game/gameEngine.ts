// 순수 게임 규칙 함수 (제품 기획서 6장). React 밖에서 동작.
import type {
  AnswerRecord,
  PlaySummary,
  ResultLabel,
  StatChanges,
  StatKey,
  Stats,
} from "@/types/game";
import {
  INITIAL_STAT_VALUE,
  QUESTIONS_PER_DAY,
  STAT_MAX,
  STAT_MIN,
  STAT_PRIORITY,
} from "./constants";

/** 시작 능력치: 모두 50. */
export function createInitialStats(): Stats {
  return {
    sense: INITIAL_STAT_VALUE,
    work: INITIAL_STAT_VALUE,
    mental: INITIAL_STAT_VALUE,
    favor: INITIAL_STAT_VALUE,
    leaveChance: INITIAL_STAT_VALUE,
  };
}

/**
 * 초기값(모두 50)부터 답변 기록을 순서대로 적용해 현재 능력치를 재계산한다.
 * 선택을 바꿀 때 클램프(0~100) 손실 없이 정확히 다시 계산하기 위해 사용한다.
 */
export function statsFromAnswers(answers: AnswerRecord[]): Stats {
  return answers.reduce(
    (acc, a) => applyStatChanges(acc, a.appliedChanges),
    createInitialStats(),
  );
}

/** 0~100 범위로 제한한다. */
export function clampStat(value: number): number {
  if (value < STAT_MIN) return STAT_MIN;
  if (value > STAT_MAX) return STAT_MAX;
  return Math.round(value);
}

/**
 * 현재 능력치에 변화량을 더한 뒤 0~100으로 제한한다 (6.1).
 * 원본 stats는 수정하지 않는다.
 */
export function applyStatChanges(stats: Stats, changes: StatChanges): Stats {
  const next = { ...stats };
  (Object.keys(next) as StatKey[]).forEach((key) => {
    next[key] = clampStat(next[key] + (changes[key] ?? 0));
  });
  return next;
}

/** 종합점수: 다섯 능력치의 산술평균을 반올림 (6.3). */
export function calcOverallScore(stats: Stats): number {
  const sum = STAT_PRIORITY.reduce((acc, key) => acc + stats[key], 0);
  return Math.round(sum / STAT_PRIORITY.length);
}

/**
 * 가장 높은 능력치 키. 동점이면 고정 우선순위 적용 (6.3).
 */
export function findStrongestStat(stats: Stats): StatKey {
  return STAT_PRIORITY.reduce((best, key) =>
    stats[key] > stats[best] ? key : best,
  );
}

/**
 * 가장 낮은 능력치 키. 동점이면 고정 우선순위 적용 (6.3).
 */
export function findWeakestStat(stats: Stats): StatKey {
  return STAT_PRIORITY.reduce((worst, key) =>
    stats[key] < stats[worst] ? key : worst,
  );
}

/** 문제 인덱스(0-base)로부터 소속 일차(1~5) 계산. */
export function dayFromIndex(index: number): number {
  return Math.floor(index / QUESTIONS_PER_DAY) + 1;
}

/** 해당 일차의 문제 인덱스가 그날 몇 번째인지(1~3). */
export function positionInDay(index: number): number {
  return (index % QUESTIONS_PER_DAY) + 1;
}

/** 해당 인덱스가 하루의 마지막 문제인지. */
export function isLastQuestionOfDay(index: number): boolean {
  return positionInDay(index) === QUESTIONS_PER_DAY;
}

/** 특정 일차에 속하는 답변만 필터링. */
export function answersForDay(
  answers: AnswerRecord[],
  day: number,
): AnswerRecord[] {
  const start = (day - 1) * QUESTIONS_PER_DAY;
  const end = start + QUESTIONS_PER_DAY;
  return answers.slice(start, end);
}

/** 여러 답변의 능력치 변화량 합산. */
export function sumStatChanges(answers: AnswerRecord[]): StatChanges {
  const total: StatChanges = {
    sense: 0,
    work: 0,
    mental: 0,
    favor: 0,
    leaveChance: 0,
  };
  answers.forEach((a) => {
    (Object.keys(total) as StatKey[]).forEach((key) => {
      total[key] += a.appliedChanges[key] ?? 0;
    });
  });
  return total;
}

/** 결과 라벨별 등장 횟수. */
export function countResultLabels(answers: AnswerRecord[]): PlaySummary {
  const summary: PlaySummary = { great: 0, safe: 0, risky: 0 };
  answers.forEach((a) => {
    summary[a.resultLabel] += 1;
  });
  return summary;
}

/** 위험한 대응 횟수. */
export function countRisky(answers: AnswerRecord[]): number {
  return answers.filter((a) => a.resultLabel === "risky").length;
}

/**
 * 합산 변화량 기준 가장 큰/작은 능력치. 동점 시 고정 우선순위 (6.4-1,2,3).
 */
export function statWithMaxChange(changes: StatChanges): StatKey {
  return STAT_PRIORITY.reduce((best, key) =>
    changes[key] > changes[best] ? key : best,
  );
}

export function statWithMinChange(changes: StatChanges): StatKey {
  return STAT_PRIORITY.reduce((worst, key) =>
    changes[key] < changes[worst] ? key : worst,
  );
}

/** 결과 라벨을 순서대로 재구성(문제 데이터 검증/요약용). */
export function resultLabelOf(record: AnswerRecord): ResultLabel {
  return record.resultLabel;
}
