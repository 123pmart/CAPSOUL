"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type InquiryFormState = {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  filmFor: string;
  relationship: string;
  stillLiving: string;
  storyImportance: string;
  filmingLocation: string;
  timeline: string;
  faithContext: string;
  extraNotes: string;
};

const initialState: InquiryFormState = {
  fullName: "",
  email: "",
  phone: "",
  region: "",
  filmFor: "",
  relationship: "",
  stillLiving: "",
  storyImportance: "",
  filmingLocation: "",
  timeline: "",
  faithContext: "",
  extraNotes: "",
};

export function InquiryForm() {
  const [formState, setFormState] = useState<InquiryFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        aria-live="polite"
        className="panel-strong rounded-[1.45rem] p-4 sm:p-5 lg:p-6"
        role="status"
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
          Inquiry received
        </p>
        <h2 className="mt-2.5 text-[1.7rem] leading-tight sm:text-[1.95rem]">
          Thank you for sharing something meaningful.
        </h2>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-[var(--muted-strong)]">
          This demo form is ready to connect to email, a CRM, or a database in
          a later phase. For now, the submission flow is simulated for review.
        </p>
        <button
          type="button"
          className="button-secondary mt-5"
          onClick={() => {
            setFormState(initialState);
            setSubmitted(false);
          }}
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="grid gap-4 sm:gap-[1.15rem]" onSubmit={handleSubmit}>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="archive-chip rounded-full px-3 py-2 text-center text-[0.73rem] uppercase tracking-[0.15em] text-[var(--muted-strong)]">
          01 Contact
        </div>
        <div className="archive-chip rounded-full px-3 py-2 text-center text-[0.73rem] uppercase tracking-[0.15em] text-[var(--muted-strong)]">
          02 Story
        </div>
        <div className="archive-chip rounded-full px-3 py-2 text-center text-[0.73rem] uppercase tracking-[0.15em] text-[var(--muted-strong)]">
          03 Filming notes
        </div>
      </div>

      <section className="panel rounded-[1.35rem] p-4 sm:p-5">
        <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              Contact details
            </p>
            <p className="text-[0.9rem] leading-6 text-[var(--muted-strong)]">
              Share the best way to reach you privately.
            </p>
          </div>
          <span className="archive-chip rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--muted-strong)]">
            Personally reviewed
          </span>
        </div>

        <div className="section-rule mb-3.5" />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="field-input"
              id="fullName"
              name="fullName"
              onChange={handleChange}
              placeholder="Your full name"
              required
              value={formState.fullName}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <input
              className="field-input"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="name@email.com"
              required
              type="email"
              value={formState.email}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              className="field-input"
              id="phone"
              name="phone"
              onChange={handleChange}
              placeholder="Best number to reach you"
              value={formState.phone}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="region">
              City / State / Region
            </label>
            <input
              className="field-input"
              id="region"
              name="region"
              onChange={handleChange}
              placeholder="Where are you located?"
              value={formState.region}
            />
          </div>
        </div>
      </section>

      <section className="panel-strong rounded-[1.35rem] p-4 sm:p-5">
        <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              Story context
            </p>
            <p className="text-[0.9rem] leading-6 text-[var(--muted-strong)]">
              Help us understand who this film is for and why now matters.
            </p>
          </div>
          <span className="archive-chip rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--muted-strong)]">
            Enough context to respond well
          </span>
        </div>

        <div className="section-rule mb-3.5" />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="filmFor">
              Who is this film for?
            </label>
            <input
              className="field-input"
              id="filmFor"
              name="filmFor"
              onChange={handleChange}
              placeholder="Parent, grandparent, spouse, loved one"
              required
              value={formState.filmFor}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="relationship">
              What is their relationship to you?
            </label>
            <input
              className="field-input"
              id="relationship"
              name="relationship"
              onChange={handleChange}
              placeholder="For example: father, grandmother, husband"
              required
              value={formState.relationship}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="stillLiving">
              Are they still living?
            </label>
            <select
              className="field-select"
              id="stillLiving"
              name="stillLiving"
              onChange={handleChange}
              required
              value={formState.stillLiving}
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="timeline">
              Desired timeline
            </label>
            <input
              className="field-input"
              id="timeline"
              name="timeline"
              onChange={handleChange}
              placeholder="As soon as possible, this season, flexible"
              value={formState.timeline}
            />
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5">
          <label className="field-label" htmlFor="storyImportance">
            What makes this story important right now?
          </label>
          <textarea
            className="field-textarea"
            id="storyImportance"
            name="storyImportance"
            onChange={handleChange}
            placeholder="Share as much or as little as you would like."
            required
            value={formState.storyImportance}
          />
        </div>
      </section>

      <section className="panel rounded-[1.35rem] p-4 sm:p-5">
        <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
              Filming notes
            </p>
            <p className="text-[0.9rem] leading-6 text-[var(--muted-strong)]">
              Optional details about place, family values, and sensitivities.
            </p>
          </div>
          <span className="archive-chip rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--muted-strong)]">
            Optional context
          </span>
        </div>

        <div className="section-rule mb-3.5" />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="filmingLocation">
              Preferred filming location
            </label>
            <input
              className="field-input"
              id="filmingLocation"
              name="filmingLocation"
              onChange={handleChange}
              placeholder="Home, family property, meaningful place"
              value={formState.filmingLocation}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label" htmlFor="faithContext">
              Are faith, spirituality, or family values an important part of this story?
            </label>
            <select
              className="field-select"
              id="faithContext"
              name="faithContext"
              onChange={handleChange}
              value={formState.faithContext}
            >
              <option value="">Select an option</option>
              <option value="yes-central">Yes, they are central</option>
              <option value="yes-partial">Yes, as one part of the story</option>
              <option value="not-really">No, not especially</option>
              <option value="not-sure">Not sure yet</option>
            </select>
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5">
          <label className="field-label" htmlFor="extraNotes">
            Anything else you want us to know?
          </label>
          <textarea
            className="field-textarea"
            id="extraNotes"
            name="extraNotes"
            onChange={handleChange}
            placeholder="Any family context, sensitivities, questions, or hopes for the film."
            value={formState.extraNotes}
          />
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(15rem,0.92fr)]">
        <div className="archive-chip rounded-[1rem] px-3.5 py-3.5">
          <p className="text-[0.9rem] leading-6 text-[var(--muted-strong)]">
            Inquiries are reviewed with care and do not obligate booking. The
            form is ready to connect to email, a CRM, or a database in a later
            phase.
          </p>
        </div>
        <div className="panel rounded-[1rem] p-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
            Quietly handled
          </p>
          <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted-strong)]">
            Story context is reviewed personally before any follow-up.
          </p>
        </div>
      </div>

      <div className="panel-ink rounded-[1.2rem] px-3.5 py-3.5 sm:px-4 sm:py-[0.95rem]">
        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:justify-between">
          <button className="button-primary" type="submit">
            Submit Inquiry
          </button>
          <p className="max-w-[24rem] text-[0.9rem] leading-6 text-[var(--text-secondary)] sm:justify-self-end">
            We reply after reviewing the story context personally.
          </p>
        </div>
      </div>
    </form>
  );
}
