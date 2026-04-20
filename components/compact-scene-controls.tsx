"use client";

type CompactSceneControlsProps = {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  const rotation = direction === "left" ? "rotate(180 10 10)" : undefined;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 4.5L12.5 10L7 15.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        transform={rotation}
      />
    </svg>
  );
}

export function CompactSceneControls({
  labels,
  activeIndex,
  onSelect,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  className = "",
}: CompactSceneControlsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()}>
      <button
        type="button"
        aria-label="Previous scene"
        className="button-secondary !h-10 !w-10 !min-h-0 shrink-0 !px-0 !py-0"
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        <Chevron direction="left" />
      </button>

      <div className="flex items-center justify-center gap-1.5">
        {labels.map((label, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`${label}-dot`}
              type="button"
              aria-label={`Show ${label}`}
              aria-pressed={isActive}
              onClick={() => onSelect(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-7 bg-[var(--accent-deep)]"
                  : "w-2.5 bg-[rgba(158,179,200,0.34)]"
              }`}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Next scene"
        className="button-secondary !h-10 !w-10 !min-h-0 shrink-0 !px-0 !py-0"
        disabled={nextDisabled}
        onClick={onNext}
      >
        <Chevron direction="right" />
      </button>
    </div>
  );
}
