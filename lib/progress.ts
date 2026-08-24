import { scenarios } from "./data/scenarios";
import { ScenarioCategory, CATEGORY_LABEL, CATEGORY_ORDER } from "./types";

export const TOTAL_SCENARIOS = scenarios.length;

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
