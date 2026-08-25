"use client";

import {
  CompletionRecord,
  LearnStage,
  NodeRecord,
  SuperProgressMap,
  UserProgress,
} from "./types";
import { SUPER_THRESHOLD } from "./data/super";

// 데이터 구조가 decision tree(NodeRecord) 기반으로 바뀌어 저장 키를 v2로 올린다.
const STORAGE_KEY = "anjeonghyeong:progress:v2";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse(json: string | null): UserProgress {
  if (!json) return { completions: [] };
  try {
    const parsed = JSON.parse(json);
    if (parsed && Array.isArray(parsed.completions)) return parsed;
    return { completions: [] };
  } catch {
    return { completions: [] };
  }
}

export function getProgress(): UserProgress {
  if (!isBrowser()) return { completions: [] };
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function saveProgress(progress: UserProgress) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage 사용 불가(사생활 보호 모드 등) — 조용히 무시, 세션 내 상태로만 동작
  }
}

/** 시나리오 완료를 기록한다. 같은 시나리오를 재학습하면 최신 기록으로 갱신한다. */
export function recordCompletion(
  scenarioId: string,
  nodes: NodeRecord[]
): CompletionRecord {
  const progress = getProgress();

  const record: CompletionRecord = {
    scenarioId,
    completedAt: new Date().toISOString(),
    nodes,
  };

  const filtered = progress.completions.filter((c) => c.scenarioId !== scenarioId);
  // 기존 super 진행상태는 보존한다.
  const next: UserProgress = { completions: [...filtered, record], super: progress.super };
  saveProgress(next);
  return record;
}

export function getCompletion(scenarioId: string): CompletionRecord | undefined {
  return getProgress().completions.find((c) => c.scenarioId === scenarioId);
}

export function isCompleted(scenarioId: string): boolean {
  return getProgress().completions.some((c) => c.scenarioId === scenarioId);
}

export function getCompletedIds(): string[] {
  return getProgress().completions.map((c) => c.scenarioId);
}

/** 진행 중인 시나리오의 노드별 판단 기록을 세션 동안만 저장 (새로고침 시 이어하기용) */
const DRAFT_PREFIX = "anjeonghyeong:draft:v2:";

interface DraftState {
  currentNodeId: string;
  records: NodeRecord[];
}

export function saveDraft(scenarioId: string, state: DraftState) {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(DRAFT_PREFIX + scenarioId, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadDraft(scenarioId: string): DraftState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_PREFIX + scenarioId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.currentNodeId === "string" && Array.isArray(parsed.records)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearDraft(scenarioId: string) {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(DRAFT_PREFIX + scenarioId);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────
// SUPER 안정형 진행상태 (심화 카드 탐색)
// ─────────────────────────────────────────────

function getSuperMap(): SuperProgressMap {
  return getProgress().super ?? {};
}

/** 특정 시나리오에서 확인한 심화 카드 id 목록 */
export function getViewedSuperCards(scenarioId: string): string[] {
  return getSuperMap()[scenarioId]?.viewedCardIds ?? [];
}

/** 심화 카드를 "확인함"으로 기록한다 (중복 없이 누적) */
export function markSuperCardViewed(scenarioId: string, cardId: string): void {
  const progress = getProgress();
  const map = { ...(progress.super ?? {}) };
  const current = new Set(map[scenarioId]?.viewedCardIds ?? []);
  current.add(cardId);
  map[scenarioId] = { viewedCardIds: Array.from(current) };
  saveProgress({ completions: progress.completions, super: map });
}

/** 시나리오의 종합 학습 단계 (none / secured / super) */
export function getLearnStage(scenarioId: string): LearnStage {
  const progress = getProgress();
  const completed = progress.completions.some((c) => c.scenarioId === scenarioId);
  if (!completed) return "none";
  const viewed = progress.super?.[scenarioId]?.viewedCardIds?.length ?? 0;
  return viewed >= SUPER_THRESHOLD ? "super" : "secured";
}
