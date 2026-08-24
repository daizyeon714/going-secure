import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "안정형 되기 — 위급한 순간에도, 나는 알고 있다",
  description:
    "불안형 탈출, 안전부터. 일상 속 위급상황을 미리 판단해보는 인터랙티브 안전학습.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line/70 py-8 px-6 text-xs text-ink-faint">
          <div className="max-w-5xl mx-auto flex flex-col gap-1">
            <p>안정형 되기는 사전 학습 서비스이며, 실시간 긴급대응 서비스가 아닙니다.</p>
            <p>실제 위급상황에서는 112·119 등 공식 구조기관에 즉시 연락하세요.</p>
            <p>본 프로토타입의 안전지침은 대한민국 공식 기관 자료를 기준으로 작성되었습니다.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
