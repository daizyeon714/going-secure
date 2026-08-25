// Going Secure 전용 아이콘 세트.
// 이모지를 쓰지 않고, 하나의 visual language(선 두께 1.6, 둥근 corner, 24 viewBox, currentColor)로 통일한다.
// SUPER 왕관을 포함한 모든 심볼은 이 파일에서 관리해 재사용한다.

import { SuperIconKey } from "@/lib/types";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

const base = (className?: string) => `inline-block ${className ?? ""}`;

/** SUPER 안정형 전용 왕관 — minimal 2D, 게임 아이템처럼 보이지 않는 차분한 형태 */
export function CrownIcon({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8.5l3.2 3 4.8-6 4.8 6 3.2-3-1.4 9H5.4L4 8.5Z" />
      <path d="M5.4 17.5h13.2" />
    </svg>
  );
}

/** 완료(안정형) 체크 */
export function CheckIcon({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={base(className)}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

// ── SUPER 심화 카드 아이콘 (화재 4 + 응급 4) ──

function Pet({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6.5" cy="9" r="1.4" />
      <circle cx="10.5" cy="6.5" r="1.4" />
      <circle cx="14.5" cy="6.5" r="1.4" />
      <circle cx="18" cy="9" r="1.4" />
      <path d="M12 10c-2.5 0-4.5 2-4.5 4.2 0 1.6 1.2 2.6 2.6 2.6.9 0 1.3-.4 1.9-.4s1 .4 1.9.4c1.4 0 2.6-1 2.6-2.6C16.5 12 14.5 10 12 10Z" />
    </svg>
  );
}

function Blackout({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13.5A7.5 7.5 0 0 1 10.5 4a7.5 7.5 0 1 0 9.5 9.5Z" />
    </svg>
  );
}

function BlockedExit({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h9v16H6z" />
      <path d="M12 12h.01" />
      <path d="M18.5 6.5l3 3M21.5 6.5l-3 3" />
    </svg>
  );
}

function HighRise({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 20V5.5L14 3v17" />
      <path d="M14 9h4v11" />
      <path d="M4 20h16" />
      <path d="M9 8h2M9 11.5h2M9 15h2" />
    </svg>
  );
}

function Alone({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7.5" r="3" />
      <path d="M6 19.5a6 6 0 0 1 12 0" />
    </svg>
  );
}

function Aed({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M12 8.5l-2 4h4l-2 4" />
    </svg>
  );
}

function Recovery({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21c3.5-2.4 6-5 6-8.5A6 6 0 0 0 6 12.5C6 16 8.5 18.6 12 21Z" />
      <path d="M9.5 11.5l1.6 1.6 3.4-3.4" />
    </svg>
  );
}

function Cpr({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20c3.5-2.4 6-5 6-8.5A6 6 0 0 0 6 11.5C6 15 8.5 17.6 12 20Z" />
      <path d="M9 11h2l1-2 1.5 3 1-1.5H16" />
    </svg>
  );
}

const SUPER_ICON_MAP: Record<SuperIconKey, (p: IconProps) => React.ReactElement> = {
  pet: Pet,
  blackout: Blackout,
  "blocked-exit": BlockedExit,
  "high-rise": HighRise,
  alone: Alone,
  aed: Aed,
  recovery: Recovery,
  cpr: Cpr,
};

export function SuperCardIcon({
  icon,
  className,
  strokeWidth,
}: {
  icon: SuperIconKey;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = SUPER_ICON_MAP[icon] ?? Alone;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}
