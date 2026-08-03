// 분석 모듈 경계 (제품 기획서 7.5).
// 화면은 이 공통 인터페이스만 사용한다. 추후 openAiAnalyzer로 교체 가능.
import type { AnswerRecord, GameAnalysis, Question } from "@/types/game";

export interface DayAnalysisInput {
  /** 분석 대상 일차 (1~5) */
  day: number;
  /** 그 일차의 답변 3개 */
  answers: AnswerRecord[];
  /** 그 일차의 문제 3개 (팁 조회용) */
  questions: Question[];
  /** 일차 종료 시점의 최종 능력치 */
  endStats: import("@/types/game").Stats;
}

export interface Analyzer {
  analyzeDay(input: DayAnalysisInput): GameAnalysis;
}
