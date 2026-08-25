import { scenarios } from "./data/scenarios";
import {
  ScenarioCategory,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  LearnStage,
  UserProgress,
} from "./types";
import { SUPER_THRESHOLD } from "./data/super";

export const TOTAL_SCENARIOS = scenarios.length;

// ── 반응형 상태(progress)로부터 순수 계산하는 헬퍼 (storage 재조회 없이) ──

export function viewedSuperCards(progress: UserProgress, scenarioId: string): string[] {
  return progress.super?.[scenarioId]?.viewedCardIds ?? [];
}

export function learnStageOf(progress: UserProgress, scenarioId: string): LearnStage {
  const completed = progress.completions.some((c) => c.scenarioId === scenarioId);
  if (!completed) return "none";
  const viewed = viewedSuperCards(progress, scenarioId).length;
  return viewed >= SUPER_THRESHOLD ? "super" : "secured";
}

export function getCategories(): ScenarioCategory[] {
  return CATEGORY_ORDER;
}

export function categoryStatusPhrase(ratioCompleted: number): string {
  // 0~1 사이 완료 비율에 따른 "안정형/불안형" 톤의 문구 (점수화 아님, 서사적 표현)
  if (ratioCompleted >= 1) return "제법 안정형";
  if (ratioCompleted >= 0.5) return "조금씩 안정형";
  if (ratioCompleted > 0) return "이제 시작한 안정형";
  return "아직 조금 불안형";
}

export { CATEGORY_LABEL };
