"use client";

import Link from "next/link";
import { Scenario, ScenarioStatus } from "@/lib/types";
import ScenarioArt from "./ScenarioArt";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";

export default function ScenarioCard({
  scenario,
  status,
}: {
  scenario: Scenario;
  status: ScenarioStatus;
}) {
  const disabled = scenario.status === "coming-soon";

  const content = (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all duration-300 ${
        disabled
          ? "opacity-70"
          : "hover:border-brand/30 hover:shadow-[0_8px_28px_-12px_rgba(43,58,71,0.25)] hover:-translate-y-0.5"
      }`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-soft">
        <ScenarioArt
          artKey={scenario.thumbnail}
          category={scenario.category}
          seed={scenario.id}
          alt={scenario.situationTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <CategoryBadge category={scenario.category} />
        </div>
        {disabled && (
          <div className="absolute inset-0 bg-cream/40" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-serif text-base font-semibold leading-snug text-ink">
          {scenario.situationTitle}
        </h3>
        <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
          {scenario.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-ink-faint">예상 {scenario.estimatedTime}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return <div aria-disabled className="cursor-default select-none">{content}</div>;
  }

  return (
    <Link href={`/scenario/${scenario.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl">
      {content}
    </Link>
  );
}
