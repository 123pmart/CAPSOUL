import { StoryPillarShowcase } from "@/components/story-pillar-showcase";
import { homepage } from "@/content/site";

export function StoryPillarExplorer() {
  return (
    <StoryPillarShowcase
      shellClassName="home-shell"
      headingStyle="home"
      eyebrow="Story architecture"
      title="Story chapters."
      description={homepage.preserveIntro}
    />
  );
}
