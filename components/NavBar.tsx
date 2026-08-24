"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/scenarios", label: "상황 둘러보기" },
  { href: "/profile", label: "나의 안전 대비" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">
            안정형 되기
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-brand text-cream"
                    : "text-ink-soft hover:bg-cream-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft"
        >
          <span className="sr-only">메뉴</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-line/70 px-5 py-3 flex flex-col gap-1 animate-fade-in">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  active ? "bg-brand text-cream" : "text-ink-soft hover:bg-cream-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
