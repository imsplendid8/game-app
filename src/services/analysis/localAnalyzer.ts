// 규칙 기반 로컬 분석기 (제품 기획서 6.4). 네트워크 호출 없음.
import type { GameAnalysis, ResultLabel } from "@/types/game";
import {
  countRisky,
  statWithMaxChange,
  statWithMinChange,
  sumStatChanges,
} from "@/features/game/gameEngine";
import { findWeakestStat } from "@/features/game/gameEngine";
import { RESULT_RANK } from "@/features/game/constants";
import {
  GOOD_MESSAGES,
  WATCH_MESSAGES,
  WEAK_STAT_TIPS,
} from "@/data/analysisMessages";
import type { Analyzer, DayAnalysisInput } from "./analyzer";

/** 그날 결과 중 가장 많이 나온 라벨. 동점이면 더 낮은 라벨 (6.4-6). */
function pickBadge(labels: ResultLabel[]): ResultLabel {
  const counts: Record<ResultLabel, number> = {
    great: 0,
    safe: 0,
    awkward: 0,
    risky: 0,
  };
  labels.forEach((l) => {
    counts[l] += 1;
  });
  const order: ResultLabel[] = ["great", "safe", "awkward", "risky"];
  let best: ResultLabel = "safe";
  let bestCount = -1;
  order.forEach((label) => {
    const c = counts[label];
    if (
      c > bestCount ||
      (c === bestCount && RESULT_RANK[label] < RESULT_RANK[best])
    ) {
      best = label;
      bestCount = c;
    }
  });
  return best;
}

export const localAnalyzer: Analyzer = {
  analyzeDay({ answers, questions, endStats }: DayAnalysisInput): GameAnalysis {
    const dayChanges = sumStatChanges(answers);
    const goodStat = statWithMaxChange(dayChanges);
    const watchStat = statWithMinChange(dayChanges);

    // 내일의 팁: 위험 대응이 있으면 해당 선택의 팁을 우선 사용 (6.4-4,5).
    let nextTip: string;
    if (countRisky(answers) > 0) {
      const riskyAnswer = answers.find((a) => a.resultLabel === "risky");
      const question = questions.find((q) => q.id === riskyAnswer?.questionId);
      const choice = question?.choices.find(
        (c) => c.id === riskyAnswer?.choiceId,
      );
      nextTip = choice?.tip ?? WEAK_STAT_TIPS[findWeakestStat(endStats)];
    } else {
      nextTip = WEAK_STAT_TIPS[findWeakestStat(endStats)];
    }

    return {
      badge: pickBadge(answers.map((a) => a.resultLabel)),
      good: GOOD_MESSAGES[goodStat],
      watch: WATCH_MESSAGES[watchStat],
      nextTip,
    };
  },
};
