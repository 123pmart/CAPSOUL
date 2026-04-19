import type { Metadata } from "next";

import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/faq-accordion";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { faqs } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about CAPSOUL legacy documentaries, from story scope and filming location to comfort on camera and delivery.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Frequently asked questions"
        title="Clear answers."
        description="A few practical details about how CAPSOUL films are guided, filmed, and delivered."
      />

      <section className="shell section-space-compact pt-0">
        <Reveal className="scene-shell scene-shell-warm scene-pad">
          <div className="content-frame-compact grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-6">
            <SectionHeading
              eyebrow="Helpful context"
              title="Practical clarity."
              description="These answers cover the questions families often ask before taking the first step."
              align="left"
            />
            <Reveal delay={110}>
              <FaqAccordion items={faqs} />
            </Reveal>
          </div>
        </Reveal>
      </section>

      <section className="shell section-space-tight pt-0">
        <Reveal>
          <CtaBand
            title="Begin here."
            description="If you are already picturing the person whose story matters most, we can begin with a quiet conversation."
            primaryAction={{ label: "Inquire Now", href: "/inquire" }}
            secondaryAction={{ label: "How It Works", href: "/how-it-works" }}
          />
        </Reveal>
      </section>
    </>
  );
}
