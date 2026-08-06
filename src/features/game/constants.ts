import type { ResultLabel, StatKey } from "@/types/game";

/** 능력치 시작값 (6.1). */
export const INITIAL_STAT_VALUE = 50;

export const STAT_MIN = 0;
export const STAT_MAX = 100;

/** 동점 처리 고정 우선순위 (6.3): 눈치력 → 업무력 → 멘탈 → 상사 호감도 → 퇴근 가능성 */
export const STAT_PRIORITY: StatKey[] = [
  "sense",
  "work",
  "mental",
  "favor",
  "leaveChance",
];

/** 화면 표시 이름 (7.3). */
export const STAT_LABELS: Record<StatKey, string> = {
  sense: "눈치력",
  work: "업무력",
  mental: "멘탈",
  favor: "상사 호감도",
  leaveChance: "퇴근 가능성",
};

/** 능력치 짧은 설명 (게임 방법 카드 2). */
export const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  sense: "말의 의도와 분위기를 읽는 힘",
  work: "우선순위를 잡고 결과물을 만드는 힘",
  mental: "당황하지 않고 버티는 힘",
  favor: "팀 리더가 느끼는 신뢰와 편안함",
  leaveChance: "오늘 제시간에 퇴근할 여유",
};

/** 능력치 아이콘 (색상 외 보조 수단). */
export const STAT_ICONS: Record<StatKey, string> = {
  sense: "👀",
  work: "🧰",
  mental: "🫀",
  favor: "🤝",
  leaveChance: "🏃",
};

/** 결과 라벨 화면 텍스트(센스/무난/아찔). */
export const RESULT_LABELS: Record<ResultLabel, string> = {
  great: "센스",
  safe: "무난",
  risky: "아찔",
};

export const RESULT_EMOJI: Record<ResultLabel, string> = {
  great: "✨",
  safe: "🙂",
  risky: "😵",
};

/** 결과 라벨 "낮음" 순서 (동점 시 과도한 칭찬 회피, 6.4-6). 아찔이 가장 낮음. */
export const RESULT_RANK: Record<ResultLabel, number> = {
  risky: 0,
  safe: 1,
  great: 2,
};

export const TOTAL_QUESTIONS = 10;
export const QUESTIONS_PER_DAY = 2;
export const TOTAL_DAYS = 5;

/** localStorage 저장 키 (7.4). */
export const SAVE_KEY = "kimnep-game-save-v1";
// 문항 구성이 15→10으로 바뀌어 이전 진행 데이터는 안전하게 초기화한다.
export const SAVE_VERSION = 2;
