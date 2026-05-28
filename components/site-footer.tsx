import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <BrandMark compact />
          <span className="site-footer-wordmark">CAPSOUL</span>
          <p className="site-footer-tagline">Legacy Documentary Studio</p>
        </div>
        <nav className="site-footer-nav" aria-label="Footer navigation">
          <a href="/">Home</a>
          <a href="/the-experience">The Experience</a>
          <a href="/how-it-works">How It Works</a>
          <a href="/what-we-preserve">What We Preserve</a>
          <a href="/inquire">Inquire</a>
        </nav>
        <div className="site-footer-legal">
          <p>&copy; {new Date().getFullYear()} Capsoul. All rights reserved.</p>
          <div className="site-footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/about">About</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
