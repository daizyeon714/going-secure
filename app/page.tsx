"use client";

import Link from "next/link";
import { getHomeScenarios, getImplementedScenarios } from "@/lib/data/scenarios";
import { useProgress } from "@/lib/useProgress";
import { learnStageOf } from "@/lib/progress";
import ScenarioCard from "@/components/ScenarioCard";

export default function HomePage() {
  const { progress, hydrated } = useProgress();
  const completedIds = new Set(progress.completions.map((c) => c.scenarioId));
  const implemented = getImplementedScenarios();
  const homeScenarios = getHomeScenarios(12);

  const recommended =
    implemented.find((s) => !completedIds.has(s.id)) ?? implemented[0];

  const completedCount = completedIds.size;

  const statLine =
    completedCount > 0
      ? `지금까지 ${completedCount}개 상황을 대비해봤어요.`
      : "아직 대비해본 상황이 없어요. 오늘 하나만 골라볼까요?";

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="border-b border-line/70 bg-gradient-to-b from-cream-soft/60 to-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-sm font-medium text-sage-strong mb-4">안정형 되기</p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-[1.25] text-ink">
            불안형 탈출, 안전부터.
          </h1>
          <p className="mt-4 text-lg sm:text-2xl font-semibold text-ink">
            골든타임, 미리 한 번 판단해보기.
          </p>
          <p className="mt-4 text-[15px] sm:text-base text-ink-soft leading-relaxed max-w-lg">
            화재, 응급상황, 재난부터 예상 밖의 순간까지.
            <br className="hidden sm:block" />
            상황을 고르고 직접 판단해보세요.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {recommended && (
              <Link
                href={`/scenario/${recommended.id}`}
                className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-strong"
              >
                오늘 하나 대비하기
              </Link>
            )}
            <Link
              href="/scenarios"
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/40 hover:text-ink"
            >
              상황 둘러보기
            </Link>
          </div>

          {hydrated && (
            <p className="mt-6 text-xs text-ink-faint animate-fade-in">{statLine}</p>
          )}
        </div>
      </section>

      {/* 카드가 바로 등장 — 흔한 상황과 극단적인 상황을 섞어서 */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 mt-9">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold text-ink">어떤 상황이든, 미리 한 번</h2>
          <Link href="/scenarios" className="text-sm text-ink-soft hover:text-ink">
            전체 보기
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {homeScenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              status={
                s.status === "coming-soon"
                  ? "coming-soon"
                  : completedIds.has(s.id)
                    ? "completed"
                    : "not-started"
              }
              stage={s.status === "coming-soon" ? "none" : learnStageOf(progress, s.id)}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/scenarios"
            className="inline-block rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-brand/40 hover:text-ink"
          >
            상황 더 보기
          </Link>
        </div>
      </section>

      {/* 설명은 최소화 — 한 줄로 차별점만 */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 mt-14">
        <div className="rounded-2xl border border-line bg-paper px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-[15px] sm:text-base text-ink leading-relaxed">
            검색은 <span className="text-ink-faint">무엇을 해야 하는지</span> 알려줘요.{" "}
            안정형 되기는 그 순간,{" "}
            <span className="font-semibold text-brand-strong">직접 판단해보게</span> 해요.
          </p>
        </div>
      </section>
    </div>
  );
}
