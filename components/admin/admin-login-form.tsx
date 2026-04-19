"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = response.headers.get("content-type")?.includes("application/json")
        ? ((await response.json()) as { ok: boolean; error?: string })
        : { ok: false, error: "Unable to log in right now." };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Unable to log in.");
        return;
      }

      window.location.replace("/admin");
    } catch {
      setErrorMessage("Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="shell section-space-compact sm:section-space-tight">
      <div className="scene-shell scene-shell-cool scene-pad lg:min-h-[calc(100dvh-8rem)]">
        <div className="content-frame-compact relative z-10 flex justify-center py-4 sm:py-6 lg:min-h-[calc(100dvh-10rem)] lg:items-center">
          <form
            className="panel-strong w-full max-w-[28rem] rounded-[1.6rem] p-4 sm:p-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <span className="eyebrow">Admin</span>
              <h1 className="page-heading text-[clamp(2rem,4vw,3rem)] leading-[0.94]">
                Sign in.
              </h1>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="space-y-1.5">
                <label className="field-label" htmlFor="admin-username">
                  Username
                </label>
                <input
                  id="admin-username"
                  className="field-input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label" htmlFor="admin-password">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  className="field-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                {errorMessage}
              </p>
            ) : null}

            <button className="button-primary mt-5 w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Enter dashboard"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
