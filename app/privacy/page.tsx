import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CAPSOUL handles inquiry form information and data requests.",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="apple-archive-experience">
        <section className="apple-section">
          <div className="apple-section-inner">
            <div className="apple-section-kicker">Privacy</div>
            <h1 className="apple-section-title">Privacy Policy.</h1>
            <p className="apple-section-copy">
              CAPSOUL collects only the information needed to review an inquiry, respond personally,
              and determine whether a private documentary project is a good fit.
            </p>
            <div className="apple-section-body apple-legal-copy liquid-glass-panel">
              <h2>Information we collect</h2>
              <p>
                The inquiry form may ask for your name, email address, phone number, estimated budget,
                region, story details, relationship information, timeline, filming location, and notes you
                choose to share.
              </p>
              <h2>How we use it</h2>
              <p>
                This information is used for personal review and follow-up only. It helps CAPSOUL understand
                the nature of the request and respond with care.
              </p>
              <h2>Sharing and sale</h2>
              <p>
                CAPSOUL does not sell inquiry information. Personal inquiry details are not provided to third
                parties for advertising or resale.
              </p>
              <h2>Retention and deletion</h2>
              <p>
                Inquiry information is retained only as long as needed for communication and project review.
                You may request deletion of your information at any time.
              </p>
              <h2>Data requests</h2>
              <p>
                To request access, correction, or deletion, contact CAPSOUL through the inquiry form and
                include enough detail to identify the original submission.
              </p>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
