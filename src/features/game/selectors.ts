// 저장 상태에서 화면용 파생 데이터를 계산하는 순수 함수.
import type {
  AnswerRecord,
  Ending,
  GameAnalysis,
  PlaySummary,
  Question,
  StatChanges,
  StatKey,
  Stats,
} from "@/types/game";
import { QUESTIONS_IN_ORDER } from "@/data/questions";
import { getEnding } from "@/data/endings";
import { resolveEnding, type EndingId } from "./endingResolver";
import { localAnalyzer } from "@/services/analysis/localAnalyzer";
import {
  answersForDay,
  calcOverallScore,
  countResultLabels,
  findStrongestStat,
  findWeakestStat,
  sumStatChanges,
} from "./gameEngine";
import { QUESTIONS_PER_DAY } from "./constants";

/** 특정 일차의 문제 목록. */
export function questionsForDay(day: number): Question[] {
  return QUESTIONS_IN_ORDER.filter((q) => q.day === day);
}

/** 하루 리포트에 필요한 데이터 묶음. */
export interface DayReport {
  day: number;
  startStats: Stats;
  endStats: Stats;
  dayChanges: StatChanges;
  analysis: GameAnalysis;
  answers: AnswerRecord[];
  questions: Question[];
}

/**
 * 하루 종료 리포트 데이터 계산.
 * @param day 대상 일차
 * @param startStats 그 일차 시작 시점의 능력치
 * @param endStats 그 일차 종료 시점의 능력치(= 현재 능력치)
 * @param allAnswers 지금까지의 전체 답변 기록
 */
export function buildDayReport(
  day: number,
  startStats: Stats,
  endStats: Stats,
  allAnswers: AnswerRecord[],
): DayReport {
  const answers = answersForDay(allAnswers, day);
  const questions = questionsForDay(day);
  const dayChanges = sumStatChanges(answers);
  const analysis = localAnalyzer.analyzeDay({
    day,
    answers,
    questions,
    endStats,
  });
  return { day, startStats, endStats, dayChanges, analysis, answers, questions };
}

/** 최종 리포트 데이터. */
export interface FinalReport {
  ending: Ending;
  endingId: EndingId;
  stats: Stats;
  overallScore: number;
  strongest: StatKey;
  weakest: StatKey;
  summary: PlaySummary;
}

export function buildFinalReport(
  stats: Stats,
  answers: AnswerRecord[],
): FinalReport {
  const endingId = resolveEnding(stats, answers);
  return {
    ending: getEnding(endingId),
    endingId,
    stats,
    overallScore: calcOverallScore(stats),
    strongest: findStrongestStat(stats),
    weakest: findWeakestStat(stats),
    summary: countResultLabels(answers),
  };
}

/** 답변 기록에서 질문+선택지 원문을 찾아 붙인 목록(리포트 표시용). */
export interface AnsweredItem {
  question: Question;
  choiceText: string;
  answer: AnswerRecord;
}

export function decorateAnswers(answers: AnswerRecord[]): AnsweredItem[] {
  return answers.map((answer) => {
    const question = QUESTIONS_IN_ORDER.find((q) => q.id === answer.questionId)!;
    const choice = question.choices.find((c) => c.id === answer.choiceId)!;
    return { question, choiceText: choice.text, answer };
  });
}

export { QUESTIONS_PER_DAY };
