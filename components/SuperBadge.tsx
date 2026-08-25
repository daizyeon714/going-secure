import { CrownIcon, CheckIcon } from "./icons";
import { LearnStage } from "@/lib/types";

// SUPER / 안정형 achievement 배지.
// 게임 아이템처럼 보이지 않도록 금색·반짝임·3D 없이, 브랜드 톤 안에서 차분하게 표현한다.

export function SuperBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";
  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand text-cream font-medium ${dim} ${className ?? ""}`}
    >
      <CrownIcon className={icon} />
      SUPER
    </span>
  );
}

export function SecuredBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";
  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-sage-tint text-sage-strong border border-sage-soft font-medium ${dim} ${className ?? ""}`}
    >
      <CheckIcon className={icon} />
      안정형
    </span>
  );
}

/** 학습 단계에 맞는 배지를 반환 (none이면 null) */
export function StageBadge({ stage, size = "md" }: { stage: LearnStage; size?: "sm" | "md" }) {
  if (stage === "super") return <SuperBadge size={size} />;
  if (stage === "secured") return <SecuredBadge size={size} />;
  return null;
}
