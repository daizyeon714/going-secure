"use client";

import { useState } from "react";

// SUPER 안정형 전용 질문 영역.
// 범용 챗봇처럼 보이지 않도록, 현재 시나리오의 edge case 탐색으로 한정한다.
// AI 미연결/실패 시에는 추측하지 않고 공식 기관 안내로 대체한다.

interface Turn {
  role: "user" | "assistant";
  text: string;
  fallback?: boolean;
}

const FALLBACK_ANSWER =
  "지금은 이 질문을 자세히 분석하기 어려운 상태예요. 이런 특수한 상황은 검증된 안내가 중요하니, 실제 상황이라면 119나 관련 전문기관(소방청·응급의료 상담 등)의 안내를 따라 주세요. 안정형 되기는 실제 위급상황용 서비스가 아니라 미리 대비해보는 학습 서비스예요.";

export default function SuperChat({
  scenarioId,
  placeholder,
}: {
  scenarioId: string;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  const canSend = value.trim().length >= 2 && !loading;

  async function send() {
    const q = value.trim();
    if (q.length < 2 || loading) return;
    setTurns((t) => [...t, { role: "user", text: q }]);
    setValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/super-question", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId, question: q }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        setTurns((t) => [...t, { role: "assistant", text: FALLBACK_ANSWER, fallback: true }]);
      } else {
        const data = await res.json();
        const answer = typeof data?.answer === "string" && data.answer ? data.answer : FALLBACK_ANSWER;
        setTurns((t) => [...t, { role: "assistant", text: answer, fallback: !data?.answer }]);
      }
    } catch {
      setTurns((t) => [...t, { role: "assistant", text: FALLBACK_ANSWER, fallback: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="font-serif text-base font-semibold text-ink">그래도 궁금한 상황이 있나요?</p>
      <p className="mt-1 text-sm text-ink-soft">
        카드에는 없지만 “이런 상황이면 어떡하지?” 싶은 게 있다면 물어보세요. 이 상황과 관련된 안전 판단만
        함께 살펴볼게요.
      </p>

      {turns.length > 0 && (
        <div className="mt-4 space-y-3">
          {turns.map((turn, i) => (
            <div
              key={i}
              className={`animate-fade-in rounded-xl px-4 py-3 text-sm leading-relaxed ${
                turn.role === "user"
                  ? "bg-brand-tint text-ink"
                  : "bg-cream-soft text-ink-soft border border-line-soft"
              }`}
            >
              {turn.text}
            </div>
          ))}
          {loading && (
            <div className="rounded-xl bg-cream-soft border border-line-soft px-4 py-3 text-sm text-ink-faint animate-fade-in">
              검증된 안전 지식 안에서 살펴보고 있어요…
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSend) send();
          }}
          className="flex-1 resize-none rounded-xl border border-line bg-cream/40 px-4 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={send}
          className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          물어보기
        </button>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        실제 위급상황에서는 즉시 119에 연락하세요. 이 기능은 미리 대비해보는 학습용이에요.
      </p>
    </div>
  );
}
