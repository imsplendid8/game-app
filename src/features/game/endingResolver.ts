// 엔딩 판정 (제품 기획서 8장). 위에서 아래 순서로 최초 일치하는 하나.
import type { AnswerRecord, Stats } from "@/types/game";
import { STAT_PRIORITY } from "./constants";
import { calcOverallScore, countRisky } from "./gameEngine";

export type EndingId =
  | "ending-survival"
  | "ending-ace"
  | "ending-trusted"
  | "ending-my-pace";

/**
 * 최종 능력치와 답변 기록으로 엔딩 ID를 결정한다.
 * 우선순위가 고정되어 조건이 겹쳐도 결과가 항상 동일하다.
 */
export function resolveEnding(stats: Stats, answers: AnswerRecord[]): EndingId {
  const riskyCount = countRisky(answers);
  const anyStatLow = STAT_PRIORITY.some((key) => stats[key] <= 25);

  // 1순위: 조용한 생존자 — 능력치 하나라도 25 이하 또는 위험 대응 5회 이상
  if (anyStatLow || riskyCount >= 5) {
    return "ending-survival";
  }

  // 2순위: 눈치백단 에이스 — 종합 75+, 눈치 70+, 업무 70+, 모든 능력치 50+
  const overall = calcOverallScore(stats);
  const allAtLeast50 = STAT_PRIORITY.every((key) => stats[key] >= 50);
  if (
    overall >= 75 &&
    stats.sense >= 70 &&
    stats.work >= 70 &&
    allAtLeast50
  ) {
    return "ending-ace";
  }

  // 3순위: 믿고 맡기는 신입 — 업무 70+ 또는 상사 호감도 70+
  if (stats.work >= 70 || stats.favor >= 70) {
    return "ending-trusted";
  }

  // 4순위: 마이웨이 성장형 — 그 외
  return "ending-my-pace";
}
