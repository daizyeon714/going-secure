import { ScenarioStatus } from "@/lib/types";

const CONFIG: Record<ScenarioStatus, { label: string; className: string }> = {
  "not-started": {
    label: "학습 가능",
    className: "bg-brand-tint text-brand-strong border border-brand-soft",
  },
  completed: {
    label: "학습 완료",
    className: "bg-sage-tint text-sage-strong border border-sage-soft",
  },
  "coming-soon": {
    label: "준비 중",
    className: "bg-cream-soft text-ink-faint border border-line-soft",
  },
};

export default function StatusBadge({ status }: { status: ScenarioStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}
