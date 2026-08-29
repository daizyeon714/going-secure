"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// 담백한 토스트 — 브랜드 톤에 맞춰 하단에서 부드럽게 fade-in, 잠시 후 사라진다.
// 화려한 애니메이션·경고색 없이 조용한 안내용.

interface ToastState {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-5">
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="animate-fade-in rounded-full border border-line bg-paper/95 px-5 py-2.5 text-sm text-ink shadow-[0_8px_28px_-12px_rgba(43,58,71,0.35)] backdrop-blur"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
