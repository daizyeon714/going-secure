"use client";

import { AnalysisResult } from "@/lib/types";

// AI(또는 fallback)의 구조화된 판단 분석을 보여준다.
// 점수/정답 표시가 아니라 "내 판단을 해석해 잘한 부분과 주의할 부분을 나눠 보여주는" 화면.
export default function AnalysisPanel({
  result,
  reactionText,
  sourceName,
  sourceUrl,
}: {
  result: AnalysisResult;
  reactionText?: string;
  sourceName: string;
  sourceUrl: string;
}) {
  const tone =
    result.lean === "recommended"
      ? "border-sage-soft bg-sage-tint"
      : result.lean === "risky"
        ? "border-risk-soft bg-risk-tint"
        : result.lean === "mixed"
          ? "border-[#e6d3a1] bg-[#faf3e2]"
          : "border-line bg-cream-soft";

  const iconTone =
    result.lean === "recommended"
      ? "text-sage-strong"
      : result.lean === "risky"
        ? "text-risk"
        : result.lean === "mixed"
          ? "text-[#8a6a25]"
          : "text-ink-soft";

  return (
    <div className={`animate-fade-in rounded-2xl border ${tone} p-5 space-y-4`}>
      {/* 헤더: 반응 + 요약 */}
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${iconTone}`}>
          {result.lean === "recommended" ? (
            <svg className="animate-gentle-check" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6.5 11.3l2.8 2.8 6.2-6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : result.lean === "unclear" ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8.4 8.6a2.6 2.6 0 015.06.8c0 1.7-2.5 2-2.5 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <circle cx="11" cy="16" r="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 6.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="11" cy="15.2" r="1" fill="currentColor" />
            </svg>
          )}
        </span>
        <div className="space-y-1">
          {reactionText && (
            <p className="font-serif text-base font-semibold text-ink">{reactionText}</p>
          )}
          {result.summary && <p className="text-sm text-ink-soft leading-relaxed">{result.summary}</p>}
        </div>
      </div>

      {/* 잘한 판단 / 주의할 판단 분리 */}
      {(result.goodJudgments.length > 0 || result.riskyJudgments.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {result.goodJudgments.length > 0 && (
            <div className="rounded-xl bg-paper/70 border border-sage-soft p-3.5">
              <p className="text-xs font-medium text-sage-strong mb-2">방향이 맞은 판단</p>
              <ul className="space-y-1.5">
                {result.goodJudgments.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
                    <span className="text-sage-strong shrink-0">＋</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.riskyJudgments.length > 0 && (
            <div className="rounded-xl bg-paper/70 border border-risk-soft p-3.5">
              <p className="text-xs font-medium text-risk mb-2">실제 상황에선 주의</p>
              <ul className="space-y-1.5">
                {result.riskyJudgments.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink leading-relaxed">
                    <span className="text-risk shrink-0">!</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 자유응답 fallback: 검증된 판단 포인트 */}
      {result.referencePoints && result.referencePoints.length > 0 && (
        <div className="rounded-xl bg-paper/70 border border-line-soft p-4 space-y-2">
          <p className="text-xs font-medium text-ink-faint">이 상황의 검증된 판단 포인트</p>
          <ul className="space-y-1.5">
            {result.referencePoints.map((pt, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span
                  className={`shrink-0 ${pt.verdict === "good" ? "text-sage-strong" : pt.verdict === "risky" ? "text-risk" : "text-ink-faint"}`}
                >
                  {pt.verdict === "good" ? "＋" : pt.verdict === "risky" ? "!" : "·"}
                </span>
                <span className="text-ink">
                  <span className="font-medium">{pt.action}</span>
                  <span className="text-ink-soft"> — {pt.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 자연스러운 피드백 설명 */}
      {result.feedback && (
        <p className="text-[15px] leading-relaxed text-ink-soft">{result.feedback}</p>
      )}

      {/* 검증된 원칙 */}
      <div className="rounded-xl bg-paper/70 border border-line-soft p-4 space-y-1.5">
        <p className="text-xs font-medium text-ink-faint tracking-wide">검증 기준 · 공식 행동원칙</p>
        <p className="text-sm leading-relaxed text-ink">{result.principleUsed}</p>
      </div>

      {/* 출처 + 해석 배지 */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-faint">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-line underline-offset-2 hover:text-ink-soft"
        >
          출처 · {sourceName}
        </a>
        <span className="rounded-full bg-cream-soft px-2 py-0.5">
          {result.aiPersonalized ? "AI가 내 판단을 해석했어요" : "검증된 기준으로 안내했어요"}
        </span>
      </div>
    </div>
  );
}
