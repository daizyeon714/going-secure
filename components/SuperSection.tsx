"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSuperContent, SUPER_THRESHOLD } from "@/lib/data/super";
import { getViewedSuperCards, markSuperCardViewed } from "@/lib/storage";
import { CrownIcon } from "./icons";
import { SuperBadge } from "./SuperBadge";
import SuperCardItem from "./SuperCardItem";
import SuperChat from "./SuperChat";

// REFLECT 이후 자연스럽게 이어지는 SUPER 안정형 섹션.
// 심화 카드 탐색 + edge case 질문. 카드 2개 이상 확인 시 SUPER 안정형 달성.
export default function SuperSection({ scenarioId }: { scenarioId: string }) {
  const content = getSuperContent(scenarioId);
  const [viewed, setViewed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewed(getViewedSuperCards(scenarioId));
    setHydrated(true);
  }, [scenarioId]);

  if (!content) return null;

  const viewedSet = new Set(viewed);
  const viewedCount = viewed.length;
  const achieved = viewedCount >= SUPER_THRESHOLD;
  const remaining = Math.max(0, SUPER_THRESHOLD - viewedCount);

  function handleView(cardId: string) {
    markSuperCardViewed(scenarioId, cardId);
    setViewed((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
  }

  return (
    <section className="mt-14">
      {/* transition */}
      <p className="text-center text-sm text-ink-faint">여기까지 알면 끝일까요?</p>

      <div className="mt-4 rounded-2xl border border-brand-soft bg-brand-tint/40 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-cream">
            <CrownIcon className="h-5 w-5" />
          </span>
          <h2 className="font-serif text-xl font-bold text-ink">여기까지 알면 SUPER 안정형</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{content.intro}</p>

        {/* 진행 상태 */}
        {hydrated && (
          <div className="mt-4 flex items-center gap-3">
            {achieved ? (
              <SuperBadge />
            ) : (
              <span className="text-xs text-ink-faint">
                심화 상황 {remaining}개만 더 살펴보면 SUPER 안정형이에요.
              </span>
            )}
            <span className="text-xs text-ink-faint">
              {viewedCount} / {content.cards.length} 확인
            </span>
          </div>
        )}

        {/* 심화 카드 */}
        <div className="mt-5 space-y-3">
          {content.cards.map((card) => (
            <SuperCardItem
              key={card.id}
              card={card}
              viewed={viewedSet.has(card.id)}
              onView={handleView}
              sourceName={content.sourceName}
              sourceUrl={content.sourceUrl}
            />
          ))}
        </div>
      </div>

      {/* SUPER 달성 안내 */}
      {hydrated && achieved && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-brand-soft bg-paper px-4 py-3 animate-fade-in">
          <span className="text-brand-strong">
            <CrownIcon className="h-5 w-5" />
          </span>
          <p className="text-sm text-ink">
            이 상황은 이제 <span className="font-semibold text-brand-strong">SUPER 안정형</span>이에요.
            조건이 달라져도 한 번 더 대비해봤어요.
          </p>
        </div>
      )}

      {/* edge case 질문 */}
      <div className="mt-6">
        <SuperChat scenarioId={scenarioId} placeholder={content.chatPlaceholder} />
      </div>

      {/* GROW — 다른 상황 탐색 유도 */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/profile"
          className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream text-center transition-colors hover:bg-brand-strong"
        >
          나의 안전 대비 보기
        </Link>
        <Link
          href="/scenarios"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft text-center transition-colors hover:border-brand/40 hover:text-ink"
        >
          다른 상황도 대비하기
        </Link>
      </div>
    </section>
  );
}
