"use client";

import { useState } from "react";
import { SuperCard } from "@/lib/types";
import { SuperCardIcon, CheckIcon } from "./icons";

// 심화 상황 카드 — 카드뉴스처럼 넘겨보는 밀도.
// 접힌 상태에서는 아이콘 + 제목 + hook, 펼치면 상황/핵심행동/이유/위험행동.
// 펼쳐서 열람하면 "확인함" 상태로 기록된다.
export default function SuperCardItem({
  card,
  viewed,
  onView,
  sourceName,
  sourceUrl,
}: {
  card: SuperCard;
  viewed: boolean;
  onView: (cardId: string) => void;
  sourceName: string;
  sourceUrl: string;
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !viewed) onView(card.id);
  }

  return (
    <div
      className={`rounded-2xl border bg-paper transition-colors ${
        viewed ? "border-sage-soft" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3.5 p-4 text-left"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            viewed ? "bg-sage-tint text-sage-strong" : "bg-brand-tint text-brand-strong"
          }`}
        >
          <SuperCardIcon icon={card.icon} className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold text-ink">{card.title}</span>
            {viewed && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-sage-tint px-1.5 py-0.5 text-[10px] font-medium text-sage-strong">
                <CheckIcon className="h-2.5 w-2.5" /> 확인함
              </span>
            )}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{card.hook}</span>
        </span>

        <span className={`mt-1 shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="animate-fade-in border-t border-line-soft px-4 pb-4 pt-4 space-y-4">
          <p className="text-sm leading-relaxed text-ink">{card.situation}</p>

          <div>
            <p className="mb-2 text-xs font-medium text-ink-faint">기억해야 할 행동</p>
            <ul className="space-y-1.5">
              {card.keyActions.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
                  <span className="shrink-0 text-sage-strong">＋</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-cream-soft px-3.5 py-3">
            <p className="mb-1 text-xs font-medium text-ink-faint">왜 그럴까</p>
            <p className="text-sm leading-relaxed text-ink-soft">{card.why}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-risk">이건 위험할 수 있어</p>
            <ul className="space-y-1.5">
              {card.riskyActions.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
                  <span className="shrink-0 text-risk">!</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-ink-faint underline decoration-line underline-offset-2 hover:text-ink-soft"
          >
            검증 기준 · {sourceName}
          </a>
        </div>
      )}
    </div>
  );
}
