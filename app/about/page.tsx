import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About",
  description: "About CAPSOUL, a private documentary studio preserving voice, stories, and legacy.",
};

export default function AboutPage() {
  return (
    <>
      <div className="apple-archive-experience">
        <section className="apple-section">
          <div className="apple-section-inner">
            <div className="apple-section-kicker">About Capsoul</div>
            <h1 className="apple-section-title">About Capsoul.</h1>
            <p className="apple-section-copy">
              CAPSOUL is a private documentary studio dedicated to preserving the voice, stories, and
              legacy of individuals for the families who love them.
            </p>
            <div className="apple-section-body apple-legal-copy liquid-glass-panel">
              <p>
                The work is intentionally personal: one filmmaker, one story, one family at a time. Every
                film is shaped slowly enough to protect tone, memory, humor, conviction, and the small
                details that make a person feel present.
              </p>
              <p>
                The process is unhurried by design. Preparation creates room for reflection, filming stays
                calm and human, and the final piece is delivered as a private heirloom rather than public
                content.
              </p>
              <div className="apple-legal-pills" aria-label="Capsoul values">
                <span className="ui-chip">Privately Produced</span>
                <span className="ui-chip">Personally Directed</span>
                <span className="ui-chip">Delivered To Last</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
