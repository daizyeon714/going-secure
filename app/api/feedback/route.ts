import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getScenarioById, getNode } from "@/lib/data/scenarios";

// 이 API는 검증된 행동원칙과 평가 기준을 "변경"하지 않는다.
// AI의 역할은 (1) 사용자가 입력/선택한 행동을 해석하고,
// (2) 사전에 검증된 원칙·기준과 비교해,
// (3) 적절한 부분과 위험한 부분을 분리해 설명하는 것뿐이다.
//
// RAG나 자유로운 안전정보 생성은 사용하지 않는다. AI는 아래 프롬프트에 주어진
// 검증 기준(evaluationCriteria)과 원칙(verifiedPrinciple)의 범위 안에서만 판단한다.
//
// AI 키가 없거나 호출이 실패하면 클라이언트가 static fallback으로 대체하므로,
// 이 라우트는 실패 시에도 흐름을 막지 않도록 명확한 에러 상태를 반환한다.

export const runtime = "nodejs";

interface FeedbackRequestBody {
  scenarioId: string;
  nodeId: string;
  inputType: "choice" | "freeText";
  choiceId?: string;
  userText?: string;
}

// 판단 해석과 SUPER 질문 모두 Google Gemini(무료 등급) 하나로 동작한다.
// GEMINI_API_KEY 하나만 넣으면 두 기능이 함께 켜지고, 없거나 실패하면 각자 안전 fallback으로 대체된다.
// 최신 키에서 gemini-1.5-flash가 404가 나는 경우가 있어 2.0-flash를 기본으로 쓴다.
// 환경변수 GEMINI_MODEL로 언제든 다른 모델명으로 바꿀 수 있다.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export async function POST(req: NextRequest) {
  let body: FeedbackRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { scenarioId, nodeId, inputType, choiceId, userText } = body;
  const scenario = getScenarioById(scenarioId);
  const node = scenario ? getNode(scenario, nodeId) : undefined;

  if (!scenario || !node) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // ── 객관식: 검증된 평가는 코드에 고정되어 있고, AI는 자연스러운 설명 문장만 개인화한다 ──
  if (inputType === "choice") {
    const choice = node.choices?.find((c) => c.id === choiceId);
    if (!choice) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const prompt = `당신은 안전 판단 훈련 서비스 "안정형 되기"의 설명 도우미입니다.
아래는 사람이 사전에 검증한 고정된 정보입니다. 사실관계나 원칙을 절대 바꾸지 말고,
사용자가 방금 내린 판단의 맥락에 맞춰 2~3문장으로 자연스럽게 풀어 설명하세요.

말투: 친한 선배가 침착하게 알려주는 느낌. "정답입니다/오답입니다" 같은 표현이나 과도한 감탄사, 이모지, 공포 조장은 쓰지 않습니다.

[상황] ${node.situation}
[사용자가 선택한 행동] ${choice.label}
[이 판단의 성향] ${choice.evaluation === "recommended" ? "권장되는 판단" : choice.evaluation === "risky" ? "위험할 수 있는 판단" : "주의가 필요한 판단"}
[검증된 이유 - 벗어나지 말 것] ${choice.reason}
[공식 행동원칙 - 벗어나지 말 것] ${node.verifiedPrinciple}

위 범위 안에서 사용자의 선택 맥락에 맞춘 자연스러운 설명만 2~3문장으로 작성하세요. 새로운 안전 수칙이나 정보를 추가하지 마세요.`;

    try {
      const text = await callGemini(apiKey, prompt, 300);
      if (!text) return NextResponse.json({ error: "ai_empty" }, { status: 502 });
      return NextResponse.json({ feedback: text.trim() });
    } catch (e) {
      console.error("[feedback:choice] Gemini 호출 실패:", e);
      return NextResponse.json({ error: "ai_exception" }, { status: 502 });
    }
  }

  // ── 자유응답: AI가 사용자의 자연어 판단을 행동 단위로 분해해 구조화 분석 ──
  const cleanText = (userText ?? "").trim();
  if (!cleanText) {
    return NextResponse.json({ error: "empty_text" }, { status: 400 });
  }

  const criteriaText = (node.evaluationCriteria ?? [])
    .map(
      (c) =>
        `- (${c.verdict === "good" ? "적절" : c.verdict === "risky" ? "위험" : "중립"}) ${c.action} :: ${c.note}`
    )
    .join("\n");

  const prompt = `당신은 안전 판단 훈련 서비스 "안정형 되기"의 판단 분석기입니다.
사용자가 위기 상황에서 자유롭게 적은 행동 계획을 "행동 단위"로 분해해 분석하세요.

매우 중요한 규칙:
- 아래 [검증 기준]과 [공식 행동원칙]의 범위 안에서만 판단하세요.
- 새로운 안전 수칙이나 정보를 절대 만들지 마세요.
- 정답/오답으로 채점하지 말고, 적절했던 판단과 위험할 수 있는 판단을 분리해 설명하세요.
- 사용자의 문장이 모호하거나 검증 기준으로 명확히 평가하기 어려우면, 억지로 추론하지 말고 confidence를 "low"로 두고 feedback에 "이 판단은 현재 시나리오 기준으로 명확히 평가하기 어려워요."라고 쓰세요.
- 말투: 친한 선배가 침착하게 알려주는 느낌. "정답/오답", 감탄사 남발, 이모지, 공포 조장 금지.

[상황]
${node.situation}
[사용자에게 던진 질문]
${node.prompt ?? ""}
[사용자가 자유롭게 입력한 판단]
${cleanText}

[검증 기준 (이 안에서만 평가)]
${criteriaText}

[공식 행동원칙 (벗어나지 말 것)]
${node.verifiedPrinciple}

반드시 아래 JSON 형식으로만, 다른 텍스트 없이 응답하세요:
{
  "summary": "사용자의 판단을 한 문장으로 요약",
  "goodJudgments": ["사용자 입력에서 적절했던 판단 (없으면 빈 배열)"],
  "riskyJudgments": ["사용자 입력에서 위험할 수 있는 판단 (없으면 빈 배열)"],
  "feedback": "사용자에게 보여줄 자연스러운 설명 (2~4문장)",
  "principleUsed": "이번에 적용된 검증된 행동원칙",
  "confidence": "high | medium | low"
}`;

  try {
    const raw = await callGemini(apiKey, prompt, 700);
    if (!raw) return NextResponse.json({ error: "ai_empty" }, { status: 502 });

    const parsed = extractJson(raw);
    if (!parsed) return NextResponse.json({ error: "ai_parse" }, { status: 502 });

    // 안전 정규화
    const result = {
      summary: String(parsed.summary ?? "").trim(),
      goodJudgments: Array.isArray(parsed.goodJudgments)
        ? parsed.goodJudgments.map((x: unknown) => String(x)).filter(Boolean).slice(0, 5)
        : [],
      riskyJudgments: Array.isArray(parsed.riskyJudgments)
        ? parsed.riskyJudgments.map((x: unknown) => String(x)).filter(Boolean).slice(0, 5)
        : [],
      feedback: String(parsed.feedback ?? "").trim(),
      principleUsed: String(parsed.principleUsed ?? node.verifiedPrinciple).trim(),
      confidence: ["high", "medium", "low"].includes(String(parsed.confidence))
        ? String(parsed.confidence)
        : "medium",
    };

    if (!result.feedback && !result.summary) {
      return NextResponse.json({ error: "ai_empty" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("[feedback:freeText] Gemini 호출 실패:", e);
    return NextResponse.json({ error: "ai_exception" }, { status: 502 });
  }
}

// 공식 SDK 사용 — AQ. / AIza 두 형식의 Gemini 키를 모두 지원한다.
async function callGemini(
  apiKey: string,
  prompt: string,
  maxTokens: number
): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { maxOutputTokens: maxTokens, temperature: 0.4 },
  });
  const text = result.text?.trim();
  return text || null;
}

// JSON 블록을 안전하게 추출 (모델이 앞뒤에 텍스트를 붙여도 파싱)
function extractJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}
