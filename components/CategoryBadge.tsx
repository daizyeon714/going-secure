import { CATEGORY_LABEL, ScenarioCategory } from "@/lib/types";

const COLORS: Record<ScenarioCategory, string> = {
  emergency: "bg-sage-tint text-sage-strong",
  urban: "bg-brand-tint text-brand-strong",
  disaster: "bg-[#e5e9ec] text-[#3f5468]",
  pet: "bg-[#f4ece0] text-[#8a5a35]",
  unexpected: "bg-cream-soft text-ink-soft",
};

export default function CategoryBadge({ category }: { category: ScenarioCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${COLORS[category]}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}
