"use client";

import { useCallback, useEffect, useState } from "react";
import { getProgress } from "./storage";
import { UserProgress } from "./types";

/** localStorage 기반 진행상황을 읽고, 변경 시(같은 탭 포함) 갱신하는 훅 */
export function useProgress() {
  // 서버 렌더링 시에는 항상 빈 값으로 시작하고, 클라이언트 마운트 후에만 실제 값을 읽는다.
  const [progress, setProgress] = useState<UserProgress>({ completions: [] });
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setProgress(getProgress());
  }, []);

  useEffect(() => {
    // 최초 마운트 시 1회 실제 값으로 동기화 (SSR에는 localStorage가 없으므로 effect에서 수행)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 클라이언트 마운트 후에만 읽을 수 있어 의도된 패턴
    setProgress(getProgress());
    setHydrated(true);

    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, [refresh]);

  return { progress, refresh, hydrated };
}
