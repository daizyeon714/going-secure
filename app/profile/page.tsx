"use client";

import Link from "next/link";
import { scenarios } from "@/lib/data/scenarios";
import { CATEGORY_LABEL, CATEGORY_ORDER, ScenarioCategory } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";
import { categoryStatusPhrase } from "@/lib/progress";
import ScenarioCard from "@/components/ScenarioCard";

const CATEGORIES: ScenarioCategory[] = CATEGORY_ORDER;

export default function ProfilePage() {
  const { progress, hydrated } = useProgress();
  const completedIds = new Set(progress.completions.map((c) => c.scenarioId));

  const experienced = scenarios.filter((s) => completedIds.has(s.id));
  const notExperienced = scenarios.filter((s) => !completedIds.has(s.id) && s.implemented);

  const byCategory = CATEGORIES.map((category) => {
    const inCategory = scenarios.filter((s) => s.category === category);
    const completed = inCategory.filter((s) => completedIds.has(s.id)).length;
    const ratio = inCategory.length > 0 ? completed / inCategory.length : 0;
    return { category, completed, total: inCategory.length, phrase: categoryStatusPhrase(ratio) };
  });

  if (!hydrated) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24">
      <p className="text-sm font-medium text-sage-strong mb-2">나의 안전 대비</p>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">나, 어디까지 안정형 됐지?</h1>
      <p className="mt-2 text-sm text-ink-soft">
        점수로 매기지 않아요. 대신 내가 대비해본 상황을 하나씩 보여드릴게요.
      </p>

      {/* 총 학습 시나리오 수 */}
      <section className="mt-8 rounded-2xl border border-line bg-paper p-5 sm:p-6">
        <p className="text-sm text-ink-soft">총 학습 시나리오</p>
        <p className="font-serif text-3xl font-bold text-ink mt-1">
          {experienced.length}
          <span className="text-base font-normal text-ink-faint"> / {scenarios.length}</span>
        </p>
      </section>

      {/* 분야별 학습 현황 */}
      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">분야별 학습 현황</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {byCategory.map((c) => (
            <div key={c.category} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-ink text-sm">{CATEGORY_LABEL[c.category]}</p>
                <span className="text-xs text-ink-faint">
                  {c.completed}/{c.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-cream-soft overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-brand animate-progress-fill"
                  style={{ width: `${c.total > 0 ? (c.completed / c.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-ink-soft">{CATEGORY_LABEL[c.category]}는 {c.phrase}.</p>
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
              <ScenarioCard key={s.id} scenario={s} status="completed" />
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
