export default function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current - 1;
        const isCurrent = i === current - 1;
        return (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full bg-line-soft overflow-hidden`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDone
                  ? "w-full bg-sage"
                  : isCurrent
                    ? "w-full bg-brand animate-progress-fill"
                    : "w-0 bg-brand"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
