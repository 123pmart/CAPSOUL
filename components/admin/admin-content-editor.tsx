"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  siteContentEditorPages,
  siteLocales,
  type SiteContent,
  type SiteContentDocument,
  type SiteContentFieldConfig,
  type SiteContentPageKey,
  type SiteLocale,
} from "@/lib/site-content-schema";

type AdminContentEditorProps = {
  initialContent: SiteContentDocument;
};

function cloneSiteContentDocument(content: SiteContentDocument) {
  return JSON.parse(JSON.stringify(content)) as SiteContentDocument;
}

function getPathSegments(path: string) {
  return path.split(".").map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
}

function getValueAtPath(source: unknown, path: string) {
  return getPathSegments(path).reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof segment === "number" && Array.isArray(current)) {
      return current[segment];
    }

    if (typeof segment === "string" && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function setValueAtPath(
  content: SiteContentDocument,
  locale: SiteLocale,
  pageKey: SiteContentPageKey,
  path: string,
  value: unknown,
) {
  const next = cloneSiteContentDocument(content) as Record<string, unknown>;
  const segments = ["locales", locale, pageKey, ...getPathSegments(path)];
  let current: Record<string, unknown> | unknown[] = next;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const nextValue =
      typeof segment === "number"
        ? (current as unknown[])[segment]
        : (current as Record<string, unknown>)[segment];

    current = nextValue as Record<string, unknown> | unknown[];
  }

  const finalSegment = segments[segments.length - 1];

  if (typeof finalSegment === "number") {
    (current as unknown[])[finalSegment] = value;
  } else {
    (current as Record<string, unknown>)[finalSegment] = value;
  }

  return next as SiteContentDocument;
}

function toFieldDisplayValue(value: unknown, fieldType: SiteContentFieldConfig["type"]) {
  if (fieldType === "list") {
    return Array.isArray(value) ? value.join("\n") : "";
  }

  return typeof value === "string" ? value : "";
}

function parseFieldValue(rawValue: string, fieldType: SiteContentFieldConfig["type"]) {
  if (fieldType === "list") {
    return rawValue
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return rawValue;
}

export function AdminContentEditor({ initialContent }: AdminContentEditorProps) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<SiteLocale>("en");
  const [activePage, setActivePage] = useState<SiteContentPageKey>("global");
  const [draftContent, setDraftContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const activePageConfig =
    siteContentEditorPages.find((page) => page.key === activePage) ?? siteContentEditorPages[0];
  const activeLocaleContent: SiteContent = draftContent.locales[activeLocale];

  async function handleSave() {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: draftContent }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        content?: SiteContentDocument;
      };

      if (!response.ok || !payload.ok || !payload.content) {
        setSaveError(payload.error ?? "Unable to save site content.");
        return;
      }

      setDraftContent(payload.content);
      setSaveSuccess("Site content updated.");
      router.refresh();
    } catch {
      setSaveError("Unable to save site content.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="panel-strong rounded-[1.7rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
              Site content
            </p>
            <h2 className="mt-2 text-[1.8rem] leading-[0.96]">Edit bilingual copy.</h2>
            <p className="mt-3 max-w-[38rem] text-[0.94rem] leading-7 text-[var(--text-secondary)]">
              Update English and Español headlines, navigation labels,
              scene copy, inquiry language, and button text without touching code.
            </p>
          </div>

          <button
            type="button"
            className="button-primary"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save content changes"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {siteLocales.map((locale) => {
            const active = locale === activeLocale;
            const label = locale === "en" ? "English" : "Español";

            return (
              <button
                key={locale}
                type="button"
                className={`nav-pill rounded-full px-4 py-2.5 text-[0.84rem] font-medium tracking-[-0.01em] ${
                  active
                    ? "border border-white/84 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.18)]"
                    : "archive-chip text-[var(--text-secondary)]"
                }`}
                onClick={() => setActiveLocale(locale)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {siteContentEditorPages.map((page) => {
            const active = page.key === activePage;

            return (
              <button
                key={page.key}
                type="button"
                className={`nav-pill rounded-full px-4 py-2.5 text-[0.84rem] font-medium tracking-[-0.01em] ${
                  active
                    ? "border border-white/84 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.18)]"
                    : "archive-chip text-[var(--text-secondary)]"
                }`}
                onClick={() => setActivePage(page.key)}
              >
                {page.label}
              </button>
            );
          })}
        </div>

        {saveError ? (
          <p className="mt-4 rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
            {saveError}
          </p>
        ) : null}

        {saveSuccess ? (
          <p className="mt-4 rounded-[1rem] border border-white/72 bg-[rgba(255,255,255,0.56)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
            {saveSuccess}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(18rem,0.38fr)_minmax(0,1fr)]">
        <div className="panel rounded-[1.6rem] p-4 sm:p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
            Current view
          </p>
          <h3 className="mt-2 text-[1.28rem] leading-[1.02]">
            {activePageConfig.label} · {activeLocale === "en" ? "English" : "Español"}
          </h3>
          <p className="mt-3 text-[0.9rem] leading-7 text-[var(--text-secondary)]">
            Fields are grouped by section so copy updates stay organized and predictable across both
            languages.
          </p>
        </div>

        <div className="grid gap-4">
          {activePageConfig.sections.map((section) => (
            <div key={section.id} className="panel rounded-[1.55rem] p-4 sm:p-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                  {section.title}
                </p>
                {section.description ? (
                  <p className="text-[0.88rem] leading-6 text-[var(--text-secondary)]">
                    {section.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const rawValue = getValueAtPath(activeLocaleContent[activePage], field.path);
                  const displayValue = toFieldDisplayValue(rawValue, field.type);
                  const isTextarea = field.type === "textarea" || field.type === "list";

                  return (
                    <div
                      key={`${activeLocale}-${activePage}-${field.path}`}
                      className={`space-y-1.5 ${isTextarea ? "md:col-span-2" : ""}`}
                    >
                      <label
                        className="field-label"
                        htmlFor={`${activeLocale}-${activePage}-${field.path}`}
                      >
                        {field.label}
                      </label>
                      {field.description ? (
                        <p className="text-[0.82rem] leading-6 text-[var(--text-tertiary)]">
                          {field.description}
                        </p>
                      ) : null}
                      {isTextarea ? (
                        <textarea
                          id={`${activeLocale}-${activePage}-${field.path}`}
                          className="field-textarea"
                          rows={field.rows ?? (field.type === "list" ? 4 : 3)}
                          value={displayValue}
                          onChange={(event) =>
                            setDraftContent((current) =>
                              setValueAtPath(
                                current,
                                activeLocale,
                                activePage,
                                field.path,
                                parseFieldValue(event.target.value, field.type),
                              ),
                            )
                          }
                        />
                      ) : (
                        <input
                          id={`${activeLocale}-${activePage}-${field.path}`}
                          className="field-input"
                          value={displayValue}
                          onChange={(event) =>
                            setDraftContent((current) =>
                              setValueAtPath(
                                current,
                                activeLocale,
                                activePage,
                                field.path,
                                parseFieldValue(event.target.value, field.type),
                              ),
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
