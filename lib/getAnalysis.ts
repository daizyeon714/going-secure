import { AnalysisResult, DecisionChoice, JudgmentLean, ScenarioNode } from "./types";

// AI(또는 fallback)에게서 구조화된 판단 분석을 받아온다.
// AI 미연결/실패/타임아웃 시에도 검증된 데이터로 안전하게 대체되어 흐름이 끊기지 않는다.

/** 객관식 선택에 대한 분석 */
export async function analyzeChoice(
  scenarioId: string,
  node: ScenarioNode,
  choice: DecisionChoice
): Promise<AnalysisResult> {
  const lean: JudgmentLean =
    choice.evaluation === "recommended"
      ? "recommended"
      : choice.evaluation === "risky"
        ? "risky"
        : "mixed";

  const good = choice.evaluation === "recommended" ? [choice.label] : [];
  const risky = choice.evaluation !== "recommended" ? [choice.label] : [];

  const base: AnalysisResult = {
    summary: `"${choice.label}" 쪽으로 판단했어.`,
    goodJudgments: good,
    riskyJudgments: risky,
    feedback: choice.reason,
    principleUsed: node.verifiedPrinciple,
    confidence: "high",
    lean,
    aiPersonalized: false,
  };

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId,
        nodeId: node.id,
        inputType: "choice",
        choiceId: choice.id,
      }),
      signal: AbortSignal.timeout(13000),
    });
    if (!res.ok) return base;
    const data = await res.json();
    if (typeof data?.feedback === "string" && data.feedback.length > 0) {
      return { ...base, feedback: data.feedback, aiPersonalized: true };
    }
    return base;
  } catch {
    return base;
  }
}

/** 자유응답에 대한 분석 */
export async function analyzeFreeText(
  scenarioId: string,
  node: ScenarioNode,
  userText: string
): Promise<AnalysisResult> {
  // AI 실패 시 fallback: 사용자 문장을 해석할 수는 없지만,
  // 이 상황에서 검증된 "판단 포인트"와 원칙을 그대로 보여줘 학습 경험을 유지한다.
  const fallback: AnalysisResult = {
    summary: node.fallbackFreeText ?? "이 상황의 검증된 판단 포인트를 함께 볼게.",
    goodJudgments: [],
    riskyJudgments: [],
    feedback:
      "지금은 AI가 네 문장을 직접 해석하기 어려워. 대신 이 상황에서 검증된 판단 기준을 기억해두면 돼.",
    principleUsed: node.verifiedPrinciple,
    confidence: "low",
    lean: "unclear",
    aiPersonalized: false,
    referencePoints: node.evaluationCriteria ?? [],
  };

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId,
        nodeId: node.id,
        inputType: "freeText",
        userText,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return fallback;
    const data = await res.json();

    if (typeof data?.feedback !== "string" || data.feedback.length === 0) {
      return fallback;
    }

    const good: string[] = Array.isArray(data.goodJudgments) ? data.goodJudgments : [];
    const risky: string[] = Array.isArray(data.riskyJudgments) ? data.riskyJudgments : [];

    const lean: JudgmentLean =
      data.confidence === "low"
        ? "unclear"
        : good.length > 0 && risky.length > 0
          ? "mixed"
          : risky.length > 0
            ? "risky"
            : good.length > 0
              ? "recommended"
              : "unclear";

    return {
      summary: typeof data.summary === "string" ? data.summary : "이번에는 이렇게 판단했네.",
      goodJudgments: good,
      riskyJudgments: risky,
      feedback: data.feedback,
      principleUsed:
        typeof data.principleUsed === "string" && data.principleUsed
          ? data.principleUsed
          : node.verifiedPrinciple,
      confidence: ["high", "medium", "low"].includes(data.confidence)
        ? data.confidence
        : "medium",
      lean,
      aiPersonalized: true,
    };
  } catch {
    return fallback;
  }
}
