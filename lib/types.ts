// 안정형 되기 — 핵심 데이터 타입 정의
//
// 이 서비스는 "질문 → 답변"형 안전 챗봇이 아니라
// "상황 → 사용자 판단 → 변화된 상황 → 다시 판단 → AI 피드백" 구조의
// 연속 판단 훈련 서비스다.
//
// 그래서 시나리오는 단순 question 배열이 아니라 decision tree(노드 그래프)로 관리한다.
// 각 노드는 객관식(choice) 또는 자유응답(freeText) 입력을 받고,
// 사용자의 선택이 다음 노드(상황)에 영향을 줄 수 있다(branch).

export type ScenarioCategory =
  | "emergency" // 생활 속 응급
  | "urban" // 도시에서
  | "disaster" // 재난
  | "pet" // 반려동물
  | "unexpected"; // 예상 밖의 상황

export const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  emergency: "생활 속 응급",
  urban: "도시에서",
  disaster: "재난",
  pet: "반려동물",
  unexpected: "예상 밖의 상황",
};

/** 화면 전반에서 쓰는 카테고리 표시 순서 */
export const CATEGORY_ORDER: ScenarioCategory[] = [
  "emergency",
  "urban",
  "disaster",
  "pet",
  "unexpected",
];

export type ScenarioStatus = "not-started" | "completed" | "coming-soon";

export type InputType = "choice" | "freeText";

/** 판단의 성향. 정답/오답이 아니라 "방향" 개념 */
export type Evaluation = "recommended" | "risky" | "caution";

/** 노드 전체에 대한 종합 성향 (진행/집계용) */
export type JudgmentLean = "recommended" | "risky" | "mixed" | "unclear";

export type Confidence = "high" | "medium" | "low";

/** 객관식 행동 선택지 (실제 행동문장) */
export interface DecisionChoice {
  id: string;
  label: string;
  evaluation: Evaluation;
  /** 선택 직후의 한 줄 반응 (톤앤매너 대사) */
  reaction: string;
  /** 이 선택이 적절/위험한 이유 — 사람이 검증한 고정 텍스트 */
  reason: string;
  /**
   * 이 선택을 했을 때 이어질 다음 노드 id.
   * - string: 해당 노드로 분기
   * - null: 이 선택으로 시나리오 종료(최종 피드백)
   * - undefined: 노드의 기본 next를 따름
   * (사용자의 선택이 다음 상황을 바꾸는 branch 구조)
   */
  next?: string | null;
}

/**
 * 자유응답 해석 기준.
 * AI는 이 기준과 verifiedPrinciple을 근거로 사용자의 자연어 판단을 "행동 단위"로 분해해 평가한다.
 * AI가 새로운 안전수칙을 만들지 않도록, 감지해야 할 행동 패턴과 그 평가를 사람이 미리 고정한다.
 */
export interface FreeTextCriterion {
  /** 감지 대상 행동의 짧은 라벨 (예: "문 상황 확인 없이 개방") */
  action: string;
  /** 이 행동의 성향 */
  verdict: "good" | "risky" | "neutral";
  /** 왜 적절/위험한지 (검증된 근거) */
  note: string;
}

/** 하나의 판단 노드 */
export interface ScenarioNode {
  id: string;
  /** 진행 표시용 순서 (분기가 있어도 같은 깊이는 같은 order를 갖도록 설계) */
  order: number;
  situation: string;
  imageAlt: string;
  imageMood: "calm" | "tense";
  inputType: InputType;

  // ── inputType === "choice" ──
  choices?: DecisionChoice[];

  // ── inputType === "freeText" ──
  /** 자유응답을 유도하는 질문 (예: "너라면 지금 가장 먼저 어떻게 할 것 같아?") */
  prompt?: string;
  /** 입력창 placeholder (예: "나라면…") */
  placeholder?: string;
  /** AI 해석 기준 (자유응답 평가의 근거) */
  evaluationCriteria?: FreeTextCriterion[];
  /** AI 미연결/실패 시 보여줄 자유응답 대체 안내 문구 */
  fallbackFreeText?: string;

  /** 이 노드의 검증된 핵심 행동원칙 (AI가 변경 불가) */
  verifiedPrinciple: string;
  /** 다음 노드 id. null이면 이 노드가 마지막(최종 피드백으로 이동) */
  next: string | null;
}

export interface Scenario {
  id: string;
  title: string;
  situationTitle: string;
  category: ScenarioCategory;
  description: string;
  thumbnail: string;
  estimatedTime: string;
  sourceName: string;
  sourceUrl: string;
  status: ScenarioStatus;
  implemented: boolean;

  /** 시작 노드 id */
  startNodeId: string;
  /** 진행바 계산용: 한 회차에서 거치는 판단 수 (분기와 무관하게 동일하도록 설계) */
  totalSteps: number;
  nodes: ScenarioNode[];

  /** 결과 화면 "이번에 익힌 핵심 원칙"에 쓰이는 검증된 원칙 목록 */
  verifiedPrinciples: string[];
}

/** AI(또는 fallback)의 구조화된 판단 분석 결과 */
export interface AnalysisResult {
  summary: string;
  goodJudgments: string[];
  riskyJudgments: string[];
  feedback: string;
  principleUsed: string;
  confidence: Confidence;
  lean: JudgmentLean;
  /** AI가 실제로 개인화 해석했는지 여부 (false면 검증된 static 기준으로 안내) */
  aiPersonalized: boolean;
  /** 자유응답 fallback 시 보여줄 "판단 포인트" (검증된 기준) */
  referencePoints?: FreeTextCriterion[];
}

/** 사용자가 각 노드에서 내린 판단 기록 */
export interface NodeRecord {
  nodeId: string;
  order: number;
  inputType: InputType;
  /** choice일 때 선택 id */
  choiceId?: string;
  /** choice일 때 선택 라벨 */
  choiceLabel?: string;
  /** freeText일 때 사용자가 입력한 문장 */
  userText?: string;
  goodJudgments: string[];
  riskyJudgments: string[];
  lean: JudgmentLean;
}

/** localStorage에 저장되는 완료 기록 */
export interface CompletionRecord {
  scenarioId: string;
  completedAt: string; // ISO date
  nodes: NodeRecord[];
}

export interface UserProgress {
  completions: CompletionRecord[];
  /** SUPER 안정형 탐색 상태 (기존 데이터와 분리, 하위호환 위해 optional) */
  super?: SuperProgressMap;
}

// ─────────────────────────────────────────────
// SUPER 안정형 — 심화 상황 탐색
// ─────────────────────────────────────────────

/** 심화 카드에서 쓰는 아이콘 키 (커스텀 SVG 세트) */
export type SuperIconKey =
  | "pet"
  | "blackout"
  | "blocked-exit"
  | "high-rise"
  | "alone"
  | "aed"
  | "recovery"
  | "cpr";

/** 하나의 심화 상황 카드 — 카드뉴스처럼 10~30초 안에 핵심을 이해하는 밀도 */
export interface SuperCard {
  id: string;
  icon: SuperIconKey;
  /** 짧은 라벨 (예: "반려동물이 집 안에 있다면?") */
  title: string;
  /** 카드 앞면 질문형 한 줄 (호기심 유발) */
  hook: string;
  /** 상황 설명 */
  situation: string;
  /** 핵심적으로 기억해야 할 행동 (2~3개) */
  keyActions: string[];
  /** 왜 그렇게 해야 하는지 짧은 설명 */
  why: string;
  /** 주의해야 할 위험행동 */
  riskyActions: string[];
}

/** 시나리오별 SUPER 안정형 콘텐츠 묶음 */
export interface SuperContent {
  scenarioId: string;
  /** 섹션 보조 문구 */
  intro: string;
  cards: SuperCard[];
  sourceName: string;
  sourceUrl: string;
  /** 질문(채팅) 입력창 placeholder */
  chatPlaceholder: string;
  /** 이 시나리오의 검증된 안전 지식 컨텍스트 (질문 답변의 근거 범위) */
  knowledgeContext: string[];
}

/** SUPER 진행 상태 — 시나리오별로 확인한 카드 id 집합 */
export interface SuperProgress {
  viewedCardIds: string[];
}

export type SuperProgressMap = Record<string, SuperProgress>;

/** 시나리오의 종합 학습 단계 (숫자 점수 대신 서사적 상태) */
export type LearnStage = "none" | "secured" | "super";
