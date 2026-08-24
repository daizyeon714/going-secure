"use client";

import { DecisionChoice } from "@/lib/types";

export default function ChoiceButton({
  choice,
  onSelect,
  disabled,
  selected,
  revealed,
}: {
  choice: DecisionChoice;
  onSelect: (choice: DecisionChoice) => void;
  disabled: boolean;
  selected: boolean;
  revealed: boolean;
}) {
  let stateClass = "border-line bg-paper hover:border-brand/40 hover:bg-brand-tint/40";

  if (revealed && selected) {
    stateClass =
      choice.evaluation === "recommended"
        ? "border-sage bg-sage-tint"
        : choice.evaluation === "risky"
          ? "border-risk/50 bg-risk-tint"
          : "border-[#c9a25e]/50 bg-[#faf3e2]";
  } else if (revealed && !selected) {
    stateClass = "border-line-soft bg-paper opacity-50";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(choice)}
      className={`w-full rounded-xl border px-4 py-3.5 text-left text-[15px] leading-relaxed text-ink transition-all duration-200 disabled:cursor-not-allowed ${stateClass}`}
    >
      {choice.label}
    </button>
  );
}
