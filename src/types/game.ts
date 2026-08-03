// 공유 타입의 단일 기준 (제품 기획서 7장 참조)

/** 능력치 데이터 키. 화면 이름은 STAT_LABELS 참조. */
export type StatKey = "sense" | "work" | "mental" | "favor" | "leaveChance";

/** 5개 능력치 묶음. 모든 값은 0~100 정수. */
export type Stats = Record<StatKey, number>;

/** 선택의 능력치 변화량. 미변경은 0. -10 ~ +10 정수. */
export type StatChanges = Record<StatKey, number>;

/** 4단계 결과 라벨. "정답/오답" 대신 사용. */
export type ResultLabel = "great" | "safe" | "awkward" | "risky";

/** 문제 안의 답변 선택지. */
export interface Choice {
  /** 문제 안에서 고유한 ID. a, b, c, d */
  id: string;
  /** 사용자가 고르는 답변 원문 */
  text: string;
  /** 4단계 결과 라벨 */
  resultLabel: ResultLabel;
  /** 이 상황의 회사어 해석 */
  interpretation: string;
  /** 선택 후 상대 반응 또는 결과 */
  reaction: string;
  /** 다음에 활용할 한 줄 팁 */
  tip: string;
  /** 5개 능력치의 정수 변화량 */
  statChanges: StatChanges;
}

/** 하나의 메신저 상황 문제. */
export interface Question {
  /** 고유 ID. day1-q1 형식 */
  id: string;
  /** 소속 일차 1~5 */
  day: number;
  /** 전체 진행 순서 1~15, 중복 없음 */
  order: number;
  /** 기록 목록에 표시할 짧은 상황명 */
  title: string;
  /** 메시지 전 상황 설명 */
  context: string;
  /** 발신자 역할명 (일반 명칭) */
  senderRole: string;
  /** 연출용 시각, 17:47 형식 */
  sentAt: string;
  /** 받은 메신저 내용 */
  message: string;
  /** 사용자에게 묻는 문장 */
  prompt: string;
  /** 3~4개 선택지, 표시 순서대로 */
  choices: Choice[];
}

/** 하나의 답변 기록. */
export interface AnswerRecord {
  questionId: string;
  choiceId: string;
  resultLabel: ResultLabel;
  /** 실제로 적용된 변화량(0~100 제한 반영 전, 선택 원본 변화량) */
  appliedChanges: StatChanges;
}

/** 엔딩 콘텐츠. */
export interface Ending {
  id: string;
  title: string;
  grade: string;
  emoji: string;
  /** 2~3문장 스토리 결과 */
  story: string;
}

/** 게임 진행 상태. */
export type GameStatus = "playing" | "dayResult" | "completed";

/** localStorage 저장 형식 (7.4). */
export interface SaveData {
  version: number;
  status: GameStatus;
  onboardingCompleted: boolean;
  currentQuestionIndex: number;
  stats: Stats;
  dayStartStats: Stats;
  answers: AnswerRecord[];
  selectedChoiceId: string | null;
  endingId: string | null;
  updatedAt: string;
}

/** 화면이 사용하는 공통 분석 결과 형태 (7.5). */
export interface GameAnalysis {
  /** 대표 평가 배지 라벨 */
  badge: ResultLabel;
  /** 잘한 점 1개 */
  good: string;
  /** 주의할 점 1개 */
  watch: string;
  /** 내일의 팁 1개 */
  nextTip: string;
}

/** 최종 리포트에 쓰는 플레이 요약. */
export interface PlaySummary {
  great: number;
  safe: number;
  awkward: number;
  risky: number;
}
