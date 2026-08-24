"use client";

import { useState } from "react";

// 자유응답 입력창. 객관식 퀴즈가 아니라 "내 언어로 판단해보는" 훈련의 핵심 UI.
export default function FreeTextInput({
  prompt,
  placeholder,
  onSubmit,
  disabled,
}: {
  prompt: string;
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const canSubmit = trimmed.length >= 2 && !disabled;

  return (
    <div className="space-y-3">
      <p className="text-[15px] font-medium text-ink">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder={placeholder ?? "나라면…"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
            onSubmit(trimmed);
          }
        }}
        className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:opacity-60"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-faint">
          정답을 맞히는 게 아니야. 지금 떠오르는 판단을 편하게 적어줘.
        </p>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(trimmed)}
          className="shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-medium text-cream transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          판단 검토받기
        </button>
      </div>
    </div>
  );
}
