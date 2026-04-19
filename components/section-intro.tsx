import type { ElementType } from "react";

import { RevealGroup, RevealItem } from "@/components/reveal";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  headingLevel?: "h1" | "h2";
  tone?: "home" | "page";
  className?: string;
  descriptionClassName?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  description,
  headingLevel = "h2",
  tone = "page",
  className = "",
  descriptionClassName = "",
}: SectionIntroProps) {
  const HeadingTag = headingLevel as ElementType;
  const headingToneClassName =
    tone === "home" ? "home-heading text-[var(--text-primary)]" : "page-heading text-[var(--text-primary)]";
  const descriptionToneClassName =
    tone === "home"
      ? "max-w-[36rem] text-[0.97rem] leading-7 sm:text-[1rem]"
      : "max-w-[34rem] text-[0.93rem] leading-7 sm:text-[0.97rem]";

  return (
    <div
      className={`mx-auto flex w-full max-w-[42rem] flex-col items-center text-center ${className}`.trim()}
    >
      <RevealGroup className="space-y-3.5 sm:space-y-4" stagger={0.1} amount={0.28}>
        <RevealItem variant="micro">
          <div className="flex justify-center">
            <span className="eyebrow">{eyebrow}</span>
          </div>
        </RevealItem>
        <RevealItem variant="hero">
          <div className="headline-container">
            <HeadingTag className={`${headingToneClassName} headline-display`}>
              {title}
            </HeadingTag>
          </div>
        </RevealItem>
        {description ? (
          <RevealItem variant="card">
            <p
              className={`mx-auto text-balance text-[var(--text-secondary)] ${descriptionToneClassName} ${descriptionClassName}`.trim()}
            >
              {description}
            </p>
          </RevealItem>
        ) : null}
      </RevealGroup>
    </div>
  );
}
