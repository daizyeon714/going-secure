import { NextRequest, NextResponse } from "next/server";
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

const MODEL = "claude-3-5-haiku-20241022";
const API_URL = "https://api.anthropic.com/v1/messages";

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(13000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ai_error" }, { status: 502 });
    }

    const data = await response.json();
    const text: string | undefined = data?.content?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "ai_empty" }, { status: 502 });
    }

    return NextResponse.json({ answer: text.trim() });
  } catch {
    return NextResponse.json({ error: "ai_exception" }, { status: 502 });
  }
}
