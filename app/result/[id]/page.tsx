"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getScenarioById } from "@/lib/data/scenarios";
import { getSuperContent } from "@/lib/data/super";
import { getCompletion } from "@/lib/storage";
import { CompletionRecord } from "@/lib/types";
import ScenarioArt from "@/components/ScenarioArt";
import SuperSection from "@/components/SuperSection";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const scenario = getScenarioById(params.id);
  const [completion, setCompletion] = useState<CompletionRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!scenario) return;
    // localStorage는 클라이언트 마운트 후에만 읽을 수 있어 effect에서 동기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompletion(getCompletion(scenario.id) ?? null);
  }, [scenario]);

  if (!scenario) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">시나리오를 찾을 수 없어요.</p>
      </div>
    );
  }

  if (completion === undefined) return null;

  if (completion === null) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-20 text-center">
        <p className="font-serif text-xl font-semibold text-ink">아직 완료 기록이 없어요</p>
        <p className="mt-2 text-sm text-ink-soft">이 상황을 먼저 판단해볼까요?</p>
        <Link
          href={`/scenario/${scenario.id}`}
          className="inline-block mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-cream"
        >
          시나리오 시작하기
        </Link>
      </div>
    );
  }

  // 노드별 판단을 잘한 판단 / 주의할 판단으로 집계
  const goodJudgments = completion.nodes.flatMap((n) => n.goodJudgments);
  const riskyJudgments = completion.nodes.flatMap((n) => n.riskyJudgments);

  const riskyCount = completion.nodes.filter(
    (n) => n.lean === "risky" || n.lean === "mixed"
  ).length;

  const headline =
    scenario.id === "studio-fire"
      ? "자취방 화재, 안정형 한 칸 상승."
      : "오늘 하나 덜 불안해졌다.";

  const superContent = getSuperContent(scenario.id);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24">
      <div className="rounded-2xl overflow-hidden border border-line mb-8 aspect-[16/9]">
        <ScenarioArt artKey={scenario.thumbnail} category={scenario.category} seed={scenario.id} alt={scenario.situationTitle} className="h-full w-full object-cover" />
      </div>

      <p className="text-sm font-medium text-sage-strong mb-2">판단 훈련 완료 · 돌아보기</p>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">{headline}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        “{scenario.situationTitle}” 상황을 {completion.nodes.length}번의 판단으로 지나왔어요. 이번에 내가
        어떻게 판단했는지 돌아볼까요?
      </p>

      {/* 이번 상황에서 잘한 판단 */}
      <section className="mt-9">
        <h2 className="font-serif text-lg font-semibold text-ink mb-3">이번 상황에서 잘한 판단</h2>
        {goodJudgments.length > 0 ? (
          <ul className="space-y-2.5">
            {goodJudgments.map((g, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-sage-tint border border-sage-soft px-4 py-3 text-sm text-ink leading-relaxed"
              >
                <span className="text-sage-strong shrink-0">＋</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">
            이번에는 방향이 맞은 판단으로 기록된 게 많지 않았어요. 다시 한번 해보면 감이 잡힐 거예요.
          </p>
        )}
      </section>

      {/* 여기서는 조금 더 주의 */}
      {riskyJudgments.length > 0 && (
        <section className="mt-9">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">여기서는 조금 더 주의</h2>
          <ul className="space-y-2.5">
            {riskyJudgments.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-risk-tint border border-risk-soft px-4 py-3 text-sm text-ink leading-relaxed"
              >
                <span className="text-risk shrink-0">!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 이번에 익힌 핵심 원칙 */}
      <section className="mt-9">
        <h2 className="font-serif text-lg font-semibold text-ink mb-3">이번에 익힌 핵심 원칙</h2>
        <ul className="space-y-2">
          {scenario.verifiedPrinciples.map((p, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink leading-relaxed">
              <span className="text-brand-strong shrink-0 font-medium">{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 출처 */}
      <section className="mt-9 rounded-xl border border-line-soft bg-cream-soft px-4 py-3.5">
        <p className="text-xs text-ink-faint">공식 정보 출처</p>
        <a
          href={scenario.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-strong underline underline-offset-2"
        >
          {scenario.sourceName}
        </a>
      </section>

      {/* 대비 완료 배지 + 다시 해보기 (REFLECT 마무리) */}
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-sage-soft bg-sage-tint/60 px-4 py-3.5">
        <div className="flex items-center gap-2 text-sm text-sage-strong">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 9.3l2.2 2.2 5-5.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          이제 이 상황은 한 번 대비해봤어. 내 안전 대비에 추가됨.
        </div>
        <Link
          href={`/scenario/${scenario.id}`}
          className="shrink-0 text-sm font-medium text-brand-strong underline underline-offset-2"
        >
          {riskyCount > 0 ? "이 상황 다시 해보기" : "같은 상황 다시 판단하기"}
        </Link>
      </div>

      {/* SUPER 안정형 — 심화 상황 탐색 (해당 콘텐츠가 있는 시나리오만) */}
      {superContent ? (
        <SuperSection scenarioId={scenario.id} />
      ) : (
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/scenarios"
            className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream text-center transition-colors hover:bg-brand-strong"
          >
            다른 상황도 대비하기
          </Link>
        </div>
      )}
    </div>
  );
}
