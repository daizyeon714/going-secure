"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { scenarios } from "@/lib/data/scenarios";
import { CATEGORY_LABEL, CATEGORY_ORDER, ScenarioCategory, ScenarioStatus } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";
import { learnStageOf } from "@/lib/progress";
import ScenarioCard from "@/components/ScenarioCard";

const CATEGORIES: ScenarioCategory[] = CATEGORY_ORDER;

function ScenariosContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as ScenarioCategory | null;
  const [filter, setFilter] = useState<ScenarioCategory | "all">(
    initialCategory && CATEGORIES.includes(initialCategory) ? initialCategory : "all"
  );
  const { progress, hydrated } = useProgress();
  const completedIds = new Set(progress.completions.map((c) => c.scenarioId));

  const filtered = useMemo(
    () => (filter === "all" ? scenarios : scenarios.filter((s) => s.category === filter)),
    [filter]
  );

  function statusFor(id: string, base: ScenarioStatus): ScenarioStatus {
    if (base === "coming-soon") return "coming-soon";
    return completedIds.has(id) ? "completed" : "not-started";
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14 pb-24">
      <div className="mb-8 sm:mb-10">
        <p className="text-sm font-medium text-sage-strong mb-2">상황 둘러보기</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          어떤 상황을 미리 판단해볼까요?
        </h1>
        <p className="mt-2 text-sm sm:text-[15px] text-ink-soft max-w-lg">
          실제로 마주칠 수 있는 위급상황을 하나씩 골라 판단해보세요. 순서는 자유예요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            filter === "all" ? "bg-brand text-cream" : "bg-cream-soft text-ink-soft hover:bg-line-soft"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              filter === c ? "bg-brand text-cream" : "bg-cream-soft text-ink-soft hover:bg-line-soft"
            }`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {hydrated && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filtered.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              status={statusFor(s.id, s.status)}
              stage={s.status === "coming-soon" ? "none" : learnStageOf(progress, s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense>
      <ScenariosContent />
    </Suspense>
  );
}
