import { ProcessShowcase } from "@/components/process-showcase";
import { homepage } from "@/content/site";

export function ProcessSequence() {
  return (
    <ProcessShowcase
      shellClassName="home-shell"
      headingStyle="home"
      eyebrow="How it works"
      title="The process."
      description={homepage.processIntro}
      reassuranceTitle={homepage.trust.title}
      reassuranceDescription={homepage.trust.description}
      footerPoints={homepage.trust.points}
    />
  );
}
