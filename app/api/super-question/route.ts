import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSuperContent } from "@/lib/data/super";
import { getScenarioById } from "@/lib/data/scenarios";

// SUPER 안정형 전용 질문 API.
// 현재 학습 중인 시나리오의 "안전 edge case"만 다룬다. 범용 챗봇이 아니다.
//
// 핵심 규칙(프롬프트로 강제):
// - 제공된 검증 컨텍스트(knowledgeContext) 안에서만 답한다.
// - 새로운 안전수칙/의료·응급·재난 행동을 사실처럼 만들어내지 않는다.
// - 근거가 부족하거나 범위를 벗어나면 추측하지 말고 공식 긴급기관·전문기관 안내를 따르도록 명확히 알린다.
// - 이 서비스는 사전 학습용이며 실시간 긴급대응 서비스가 아님을 유지한다.
//
// AI 키가 없거나 실패하면 클라이언트가 안전한 fallback 문구로 대체한다.

export const runtime = "nodejs";

// SUPER 질문 챗봇만 Google Gemini(무료 등급)를 사용한다.
// 나머지 AI 기능(/api/feedback 등)은 그대로 유지된다.
// Gemini 키가 없거나 한도 초과·실패 시에는 명확한 에러를 반환하고,
// 클라이언트(SuperChat)가 미리 준비된 안전 fallback 문구로 대체한다.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

interface Body {
  scenarioId: string;
  question: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const scenario = getScenarioById(body.scenarioId);
  const content = getSuperContent(body.scenarioId);
  const question = (body.question ?? "").trim();

  if (!scenario || !content) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (question.length < 2) {
    return NextResponse.json({ error: "empty_question" }, { status: 400 });
  }

  // Gemini 무료 키 (GEMINI_API_KEY 또는 GOOGLE_API_KEY 중 아무거나)
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    // 키가 없으면 클라이언트가 안전 fallback으로 넘어간다.
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const contextText = content.knowledgeContext.map((c, i) => `${i + 1}. ${c}`).join("\n");

  const prompt = `당신은 안전 판단 훈련 서비스 "안정형 되기(Going Secure)"의 안전 학습 도우미입니다.
사용자가 "${scenario.situationTitle}" 상황과 관련해 궁금한 특수 상황(edge case)을 물었습니다.

반드시 지킬 규칙:
- 아래 [검증된 안전 지식] 범위 안에서만 답하세요. 이 범위를 벗어나는 새로운 안전수칙이나 의료·응급·재난 행동을 지어내지 마세요.
- 질문이 이 시나리오의 안전 대응과 관련 없으면, 정중히 "이 시나리오와 관련된 안전 상황에 대해서만 도와드릴 수 있어요."라고 안내하세요.
- 검증된 지식만으로 충분히 답할 수 없으면, 추측하지 말고 "이 부분은 정확한 안내가 필요해요. 실제 상황에서는 119나 관련 전문기관의 안내를 따라 주세요."라고 답하세요.
- 이 서비스는 사전 학습용이며 실시간 긴급대응 서비스가 아닙니다. 실제 위급상황이면 즉시 119에 연락하도록 안내하세요.
- 말투: 친한 선배가 침착하게 알려주는 느낌. "정답/오답", 감탄사 남발, 이모지, 공포 조장 금지.
- 3~5문장 이내로 간결하게.

[검증된 안전 지식 (이 범위 안에서만 답변)]
${contextText}

[사용자 질문]
${question}

위 규칙과 검증된 지식 범위 안에서 답변만 작성하세요.`;

  try {
    // 공식 SDK 사용 — AQ. / AIza 두 형식의 키를 모두 지원한다.
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { maxOutputTokens: 500, temperature: 0.4 },
    });

    const text = result.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "ai_empty" }, { status: 502 });
    }

    return NextResponse.json({ answer: text });
  } catch (e) {
    console.error("[super-question] Gemini 호출 실패:", e);
    // 키 오류·한도 초과·네트워크 오류 등 → 클라이언트가 안전 fallback으로 대체
    return NextResponse.json({ error: "ai_exception" }, { status: 502 });
  }
}
