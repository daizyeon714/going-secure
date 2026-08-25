"use client";

import Link from "next/link";
import { scenarios } from "@/lib/data/scenarios";
import { CATEGORY_LABEL, CATEGORY_ORDER, LearnStage, ScenarioCategory } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";
import { learnStageOf, viewedSuperCards } from "@/lib/progress";
import ScenarioCard from "@/components/ScenarioCard";
import { StageBadge, SuperBadge, SecuredBadge } from "@/components/SuperBadge";

const CATEGORIES: ScenarioCategory[] = CATEGORY_ORDER;

/** 카테고리의 대표 학습 단계 (그 분야에서 가장 높이 도달한 단계) */
function categoryStage(stages: LearnStage[]): LearnStage {
  if (stages.includes("super")) return "super";
  if (stages.includes("secured")) return "secured";
  return "none";
}

export default function ProfilePage() {
  const { progress, hydrated } = useProgress();
  const completedIds = new Set(progress.completions.map((c) => c.scenarioId));

  const experienced = scenarios.filter((s) => completedIds.has(s.id));
  const notExperienced = scenarios.filter((s) => !completedIds.has(s.id) && s.implemented);

  // 전체 progression
  const basicCount = experienced.length;
  const superScenarioCount = scenarios.filter(
    (s) => learnStageOf(progress, s.id) === "super"
  ).length;
  const totalSuperExplored = scenarios.reduce(
    (sum, s) => sum + viewedSuperCards(progress, s.id).length,
    0
  );

  const byCategory = CATEGORIES.map((category) => {
    const inCategory = scenarios.filter((s) => s.category === category);
    const completed = inCategory.filter((s) => completedIds.has(s.id)).length;
    const stage = categoryStage(inCategory.map((s) => learnStageOf(progress, s.id)));
    return { category, completed, total: inCategory.length, stage };
  });

  if (!hydrated) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24">
      <p className="text-sm font-medium text-sage-strong mb-2">나의 안전 대비</p>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">나, 어디까지 안정형 됐지?</h1>
      <p className="mt-2 text-sm text-ink-soft">
        점수로 매기지 않아요. 대신 내가 대비해본 상황과, 조건이 달라진 심화 상황까지 얼마나 살펴봤는지
        보여드릴게요.
      </p>

      {/* 전체 progression */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <SecuredBadge size="sm" />
            <p className="text-sm text-ink-soft">기본 안전 훈련</p>
          </div>
          <p className="font-serif text-2xl font-bold text-ink mt-2">
            {basicCount}개 시나리오 완료
          </p>
        </div>
        <div className="rounded-2xl border border-brand-soft bg-brand-tint/40 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <SuperBadge size="sm" />
            <p className="text-sm text-ink-soft">SUPER 안정형</p>
          </div>
          <p className="font-serif text-2xl font-bold text-ink mt-2">
            심화 상황 {totalSuperExplored}개 탐색
          </p>
          {superScenarioCount > 0 && (
            <p className="mt-1 text-xs text-brand-strong">
              {superScenarioCount}개 시나리오에서 SUPER 안정형 달성
            </p>
          )}
        </div>
      </section>

      {/* 분야별 학습 현황 */}
      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">분야별 안전 대비</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {byCategory.map((c) => (
            <div key={c.category} className="flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-4">
              <div>
                <p className="font-medium text-ink text-sm">{CATEGORY_LABEL[c.category]}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  {c.completed}/{c.total} 상황 대비
                </p>
              </div>
              {c.stage !== "none" ? (
                <StageBadge stage={c.stage} size="sm" />
              ) : (
                <span className="text-xs text-ink-faint">미학습</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 대비해본 상황 */}
      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">내가 대비해본 상황</h2>
        {experienced.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experienced.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                status="completed"
                stage={learnStageOf(progress, s.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-cream-soft p-6 text-center">
            <p className="text-sm text-ink-soft">아직 대비해본 상황이 없어요.</p>
            <Link
              href="/scenarios"
              className="inline-block mt-3 text-sm text-brand-strong underline underline-offset-2"
            >
              첫 상황 둘러보기
            </Link>
          </div>
        )}
      </section>

      {/* 아직 경험하지 않은 상황 */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-ink">아직 경험하지 않은 상황</h2>
          <span className="text-sm text-ink-faint">{notExperienced.length}개</span>
        </div>
        {notExperienced.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notExperienced.map((s) => (
              <ScenarioCard key={s.id} scenario={s} status="not-started" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">구현된 상황을 모두 대비해봤어요. 새로운 상황이 곧 추가돼요.</p>
        )}
      </section>
    </div>
  );
}
