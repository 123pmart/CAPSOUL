import { SectionIntro } from "@/components/section-intro";
import { RevealGroup, RevealItem } from "@/components/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  if (align === "center") {
    return <SectionIntro eyebrow={eyebrow} title={title} description={description} />;
  }

  return (
    <div className="max-w-[36rem] text-left">
      <RevealGroup className="space-y-3.5 sm:space-y-4" stagger={0.1} amount={0.28}>
        <RevealItem variant="micro">
          <div className="flex justify-start">
            <span className="eyebrow">{eyebrow}</span>
          </div>
        </RevealItem>
        <RevealItem variant="hero">
          <div className="headline-container headline-container-start">
            <h2 className="page-heading headline-support">{title}</h2>
          </div>
        </RevealItem>
        <RevealItem variant="card">
          <p className="max-w-[32rem] text-[0.95rem] leading-7 text-[var(--text-secondary)] sm:text-[0.99rem]">
            {description}
          </p>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
