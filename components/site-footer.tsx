import { BrandMark } from "@/components/brand-mark";
import { TransitionLink } from "@/components/transition-link";
import { company, footerLinks, homepage } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="section-space-tight pt-2">
      <div className="shell">
        <div className="scene-shell scene-shell-cool scene-pad">
          <div className="relative z-10 content-frame grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:gap-5">
            <div className="panel-strong rounded-[1.6rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <BrandMark />
                <span className="archive-chip rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  Private legacy films
                </span>
              </div>
              <p className="mt-4 max-w-[38rem] text-[0.96rem] leading-7 text-[var(--text-secondary)]">
                {homepage.footer}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="archive-chip rounded-[1.05rem] px-3.5 py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Discreet
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                    Personally guided from inquiry onward.
                  </p>
                </div>
                <div className="panel rounded-[1.05rem] p-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Lasting
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                    Built as a family heirloom rather than campaign content.
                  </p>
                </div>
                <div className="panel rounded-[1.05rem] p-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Bespoke
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                    Each film is shaped around the person, not a formula.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="panel-ink rounded-[1.35rem] p-4 sm:p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                  Contact
                </p>
                <div className="mt-3 grid gap-2 text-[0.94rem] text-[var(--text-primary)]">
                  <a href={`mailto:${company.email}`} className="hover:text-[var(--accent-deep)]">
                    {company.email}
                  </a>
                  <a href={`tel:${company.phone.replace(/\D+/g, "")}`} className="hover:text-[var(--accent-deep)]">
                    {company.phone}
                  </a>
                </div>
                <TransitionLink className="button-secondary mt-4" href="/inquire">
                  Inquire
                </TransitionLink>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel rounded-[1.2rem] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Navigate
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {footerLinks.primary.map((item) => (
                      <li key={item.href}>
                        <TransitionLink
                          href={item.href}
                          className="text-[0.92rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          {item.label}
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="panel rounded-[1.2rem] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    More
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {footerLinks.secondary.map((item) => (
                      <li key={item.href}>
                        <TransitionLink
                          href={item.href}
                          className="text-[0.92rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          {item.label}
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
