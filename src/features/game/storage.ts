// localStorage 저장/불러오기 및 검증 (제품 기획서 7.4, 5단계).
import type { SaveData, StatKey, Stats } from "@/types/game";
import { SAVE_KEY, SAVE_VERSION, TOTAL_QUESTIONS } from "./constants";

const STAT_KEYS: StatKey[] = [
  "sense",
  "work",
  "mental",
  "favor",
  "leaveChance",
];

function isValidStats(value: unknown): value is Stats {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return STAT_KEYS.every(
    (key) => typeof obj[key] === "number" && Number.isFinite(obj[key]),
  );
}

/** 저장 데이터의 버전, 필수 필드, 인덱스 범위를 검증한다 (7.4). */
export function isValidSaveData(value: unknown): value is SaveData {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;

  if (d.version !== SAVE_VERSION) return false;
  if (
    d.status !== "playing" &&
    d.status !== "dayResult" &&
    d.status !== "completed"
  ) {
    return false;
  }
  if (typeof d.onboardingCompleted !== "boolean") return false;
  if (
    typeof d.currentQuestionIndex !== "number" ||
    !Number.isInteger(d.currentQuestionIndex) ||
    d.currentQuestionIndex < 0 ||
    d.currentQuestionIndex > TOTAL_QUESTIONS
  ) {
    return false;
  }
  if (!isValidStats(d.stats) || !isValidStats(d.dayStartStats)) return false;
  if (!Array.isArray(d.answers)) return false;
  if (
    d.selectedChoiceId !== null &&
    typeof d.selectedChoiceId !== "string"
  ) {
    return false;
  }
  if (d.endingId !== null && typeof d.endingId !== "string") return false;
  if (typeof d.updatedAt !== "string") return false;

  return true;
}

/** localStorage 사용 가능 여부. 차단 환경에서도 예외를 던지지 않는다. */
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    const probe = "__kimnep_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export interface LoadResult {
  /** 유효한 저장 데이터. 없으면 null */
  save: SaveData | null;
  /** 손상·구버전 데이터를 발견해 삭제했는지 (토스트 표시용) */
  recovered: boolean;
}

/**
 * 저장 데이터를 불러온다. 손상·구버전·차단 시 null을 반환하고,
 * 손상된 데이터는 삭제한다. recovered=true면 손상 데이터를 복구(삭제)했다는 뜻.
 */
export function loadSave(): LoadResult {
  const storage = getStorage();
  if (!storage) return { save: null, recovered: false };
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return { save: null, recovered: false };
  try {
    const parsed = JSON.parse(raw);
    if (isValidSaveData(parsed)) return { save: parsed, recovered: false };
  } catch {
    // 파싱 실패 → 아래에서 삭제
  }
  storage.removeItem(SAVE_KEY);
  return { save: null, recovered: true };
}

/** 저장 데이터 전체를 교체한다. 차단 환경에서는 조용히 무시. */
export function writeSave(data: SaveData): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // 저장 실패해도 현재 세션 플레이는 계속 가능해야 한다.
  }
}

/** 저장 데이터를 삭제한다 (새 게임 시). */
export function clearSave(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // 무시
  }
}
