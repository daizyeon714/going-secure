import { CATEGORY_LABEL, ScenarioCategory } from "@/lib/types";

export default function ProgressSummary({
  completedCount,
  totalCount,
  byCategory,
}: {
  completedCount: number;
  totalCount: number;
  byCategory: { category: ScenarioCategory; completed: number; total: number }[];
}) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft">나의 현재 대비 현황</p>
          <p className="font-serif text-xl font-semibold text-ink mt-0.5">
            {totalCount}개 중 {completedCount}개 상황을 학습했어요
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-2xl font-semibold text-brand-strong">{pct}%</p>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-cream-soft overflow-hidden">
        <div
          className="h-full rounded-full bg-brand animate-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {byCategory.map((c) => (
          <div key={c.category} className="rounded-xl bg-cream-soft px-3 py-2.5">
            <p className="text-xs text-ink-faint">{CATEGORY_LABEL[c.category]}</p>
            <p className="text-sm font-medium text-ink mt-0.5">
              {c.completed}/{c.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
