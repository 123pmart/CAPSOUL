"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminContentEditor } from "@/components/admin/admin-content-editor";
import type { PublicAdminUser } from "@/lib/admin-auth";
import type { LeadRecord, LeadStatus } from "@/lib/leads";
import { mediaObjectPositionOptions, type ResolvedMediaSlot } from "@/lib/media-shared";
import type { SiteContentDocument } from "@/lib/site-content-schema";

type AdminDashboardProps = {
  currentAdmin: PublicAdminUser;
  initialLeads: LeadRecord[];
  initialMediaSlots: ResolvedMediaSlot[];
  initialSiteContent: SiteContentDocument;
};

type DashboardTab = "leads" | "media" | "content" | "settings";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(status: LeadStatus) {
  if (status === "contacted") return "text-[var(--accent-deep)]";
  if (status === "closed") return "text-[var(--muted-strong)]";
  return "text-[var(--text-primary)]";
}

export function AdminDashboard({
  currentAdmin,
  initialLeads,
  initialMediaSlots,
  initialSiteContent,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("leads");
  const [leads, setLeads] = useState(initialLeads);
  const [mediaSlots, setMediaSlots] = useState(initialMediaSlots);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [leadError, setLeadError] = useState("");
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsUsername, setSettingsUsername] = useState(currentAdmin.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [removingSlotId, setRemovingSlotId] = useState<string | null>(null);
  const [savingObjectPositionSlotId, setSavingObjectPositionSlotId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [mediaObjectPositions, setMediaObjectPositions] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialMediaSlots.map((slot) => [slot.id, slot.objectPosition]),
      ) as Record<string, string>,
  );

  const filteredLeads = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesQuery =
        !query ||
        [
          lead.fullName,
          lead.email,
          lead.filmFor,
          lead.relationship,
          lead.region,
          lead.estimatedBudget,
          lead.storyImportance,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [leads, searchValue, statusFilter]);

  const activeLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? null;

  const mediaGroups = useMemo(() => {
    return mediaSlots.reduce<Record<string, ResolvedMediaSlot[]>>((groups, slot) => {
      groups[slot.pageLabel] = [...(groups[slot.pageLabel] ?? []), slot];
      return groups;
    }, {});
  }, [mediaSlots]);

  useEffect(() => {
    if (!activeLead && filteredLeads.length > 0) {
      setSelectedLeadId(filteredLeads[0].id);
      return;
    }

    if (activeLead && activeLead.id !== selectedLeadId) {
      setSelectedLeadId(activeLead.id);
    }
  }, [activeLead, filteredLeads, selectedLeadId]);

  useEffect(() => {
    setMediaObjectPositions((current) => {
      const next = { ...current };

      for (const slot of mediaSlots) {
        next[slot.id] = current[slot.id] ?? slot.objectPosition;
      }

      return next;
    });
  }, [mediaSlots]);

  async function handleLeadStatusChange(leadId: string, status: LeadStatus) {
    setLeadError("");

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        lead?: LeadRecord;
      };

      if (!response.ok || !payload.ok || !payload.lead) {
        setLeadError(payload.error ?? "Unable to update this lead.");
        return;
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === payload.lead?.id ? payload.lead : lead)),
      );
    } catch {
      setLeadError("Unable to update this lead.");
    }
  }

  async function handleLeadDelete(leadId: string) {
    const lead = leads.find((entry) => entry.id === leadId);

    if (!lead) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete the lead for ${lead.fullName}? This cannot be undone.`)
    ) {
      return;
    }

    setLeadError("");
    setDeletingLeadId(leadId);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        lead?: LeadRecord;
      };

      if (!response.ok || !payload.ok || !payload.lead) {
        setLeadError(payload.error ?? "Unable to delete this lead.");
        return;
      }

      setLeads((current) => current.filter((entry) => entry.id !== payload.lead?.id));
      setSelectedLeadId((current) => (current === payload.lead?.id ? null : current));
    } catch {
      setLeadError("Unable to delete this lead.");
    } finally {
      setDeletingLeadId((current) => (current === leadId ? null : current));
    }
  }

  async function handleMediaUpload(slotId: string, file: File | null) {
    if (!file) {
      setUploadErrors((current) => ({
        ...current,
        [slotId]: "Choose an image before uploading.",
      }));
      return;
    }

    setUploadingSlotId(slotId);
    setUploadErrors((current) => ({
      ...current,
      [slotId]: "",
    }));

    try {
      const formData = new FormData();
      formData.set("slotId", slotId);
      formData.set("file", file);
      formData.set(
        "objectPosition",
        mediaObjectPositions[slotId] ??
          mediaSlots.find((slot) => slot.id === slotId)?.objectPosition ??
          "center center",
      );

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        slot?: ResolvedMediaSlot;
      };

      if (!response.ok || !payload.ok || !payload.slot) {
        setUploadErrors((current) => ({
          ...current,
          [slotId]: payload.error ?? "Unable to upload this image.",
        }));
        return;
      }

      const updatedSlot = payload.slot;
      setMediaSlots((current) =>
        current.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot)),
      );
      setMediaObjectPositions((current) => ({
        ...current,
        [slotId]: updatedSlot.objectPosition,
      }));
    } catch {
      setUploadErrors((current) => ({
        ...current,
        [slotId]: "Unable to upload this image.",
      }));
    } finally {
      setUploadingSlotId((current) => (current === slotId ? null : current));
    }
  }

  async function handleMediaRemove(slotId: string) {
    setRemovingSlotId(slotId);
    setUploadErrors((current) => ({
      ...current,
      [slotId]: "",
    }));

    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slotId }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        slot?: ResolvedMediaSlot;
      };

      if (!response.ok || !payload.ok || !payload.slot) {
        setUploadErrors((current) => ({
          ...current,
          [slotId]: payload.error ?? "Unable to remove this image.",
        }));
        return;
      }

      const updatedSlot = payload.slot;
      setMediaSlots((current) =>
        current.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot)),
      );
      setMediaObjectPositions((current) => ({
        ...current,
        [slotId]: updatedSlot.objectPosition,
      }));
    } catch {
      setUploadErrors((current) => ({
        ...current,
        [slotId]: "Unable to remove this image.",
      }));
    } finally {
      setRemovingSlotId((current) => (current === slotId ? null : current));
    }
  }

  async function handleMediaObjectPositionSave(slotId: string) {
    const objectPosition =
      mediaObjectPositions[slotId] ??
      mediaSlots.find((slot) => slot.id === slotId)?.objectPosition ??
      "center center";

    setSavingObjectPositionSlotId(slotId);
    setUploadErrors((current) => ({
      ...current,
      [slotId]: "",
    }));

    try {
      const response = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slotId, objectPosition }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        slot?: ResolvedMediaSlot;
      };

      if (!response.ok || !payload.ok || !payload.slot) {
        setUploadErrors((current) => ({
          ...current,
          [slotId]: payload.error ?? "Unable to save image framing.",
        }));
        return;
      }

      const updatedSlot = payload.slot;
      setMediaSlots((current) =>
        current.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot)),
      );
      setMediaObjectPositions((current) => ({
        ...current,
        [slotId]: updatedSlot.objectPosition,
      }));
    } catch {
      setUploadErrors((current) => ({
        ...current,
        [slotId]: "Unable to save image framing.",
      }));
    } finally {
      setSavingObjectPositionSlotId((current) => (current === slotId ? null : current));
    }
  }

  async function handleSettingsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (!currentPassword) {
      setSettingsError("Current password is required.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsError("New passwords do not match.");
      return;
    }

    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: settingsUsername,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        user?: PublicAdminUser;
      };

      if (!response.ok || !payload.ok || !payload.user) {
        setSettingsError(payload.error ?? "Unable to save your settings.");
        return;
      }

      setSettingsUsername(payload.user.username);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSettingsSuccess("Account settings updated.");
      router.refresh();
    } catch {
      setSettingsError("Unable to save your settings.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <section className="shell section-space-tight">
      <div className="scene-shell scene-shell-cool scene-pad admin-dashboard-shell">
        <div className="content-frame-wide relative z-10 grid gap-4">
          <div className="panel-strong rounded-[1.9rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="mt-1 flex flex-wrap gap-2.5">
                {([
                  { key: "leads", label: "Leads" },
                  { key: "media", label: "Media" },
                  { key: "content", label: "Site Content" },
                  { key: "settings", label: "Account" },
                ] as const).map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`nav-pill rounded-full px-4 py-2.5 text-[0.84rem] font-medium tracking-[-0.01em] ${
                        active
                          ? "border border-white/84 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.18)]"
                          : "archive-chip text-[var(--text-secondary)]"
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-[auto_auto]">
                <div className="archive-chip rounded-[1rem] px-4 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Signed in as
                  </p>
                  <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-primary)]">
                    {currentAdmin.username}
                  </p>
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>

          {activeTab === "leads" ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(22rem,0.72fr)_minmax(0,1.28fr)]">
              <div className="panel rounded-[1.7rem] p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-1.5">
                    <label className="field-label" htmlFor="lead-search">
                      Search leads
                    </label>
                    <input
                      id="lead-search"
                      className="field-input"
                      placeholder="Search by name, email, region, budget, or story"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="field-label" htmlFor="lead-status-filter">
                      Status
                    </label>
                    <select
                      id="lead-status-filter"
                      className="field-select"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as LeadStatus | "all")
                      }
                    >
                      <option value="all">All leads</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="home-divider my-4" />

                <div className="grid gap-3">
                  {filteredLeads.length ? (
                    filteredLeads.map((lead) => {
                      const isActive = lead.id === activeLead?.id;

                      return (
                        <button
                          key={lead.id}
                          type="button"
                          className={`text-left rounded-[1.2rem] border px-4 py-3.5 ${
                            isActive
                              ? "border-white/88 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,239,247,0.98))] shadow-[0_16px_30px_rgba(152,169,189,0.18)]"
                              : "border-[rgba(181,196,211,0.28)] bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(243,248,252,0.68))]"
                          }`}
                          onClick={() => setSelectedLeadId(lead.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                                {lead.fullName}
                              </p>
                              <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-primary)]">
                                {lead.filmFor}
                              </p>
                            </div>
                            <span
                              className={`archive-chip rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] ${statusTone(lead.status)}`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          <p className="mt-3 text-[0.86rem] leading-6 text-[var(--text-secondary)]">
                            {lead.email}
                          </p>
                          <p className="mt-1 text-[0.78rem] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                            {formatTimestamp(lead.submittedAt)}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="archive-chip rounded-[1.2rem] px-4 py-4 text-[0.92rem] leading-6 text-[var(--text-secondary)]">
                      No leads match the current search.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel-strong rounded-[1.7rem] p-5 sm:p-6">
                {activeLead ? (
                  <div className="grid gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                          Lead detail
                        </p>
                        <h2 className="mt-2 text-[1.8rem] leading-[0.96]">
                          {activeLead.fullName}
                        </h2>
                        <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-secondary)]">
                          Submitted {formatTimestamp(activeLead.submittedAt)}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="field-label" htmlFor="active-lead-status">
                          Lead status
                        </label>
                        <select
                          id="active-lead-status"
                          className="field-select min-w-[12rem]"
                          value={activeLead.status}
                          onChange={(event) =>
                            handleLeadStatusChange(
                              activeLead.id,
                              event.target.value as LeadStatus,
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={deletingLeadId === activeLead.id}
                        onClick={() => handleLeadDelete(activeLead.id)}
                      >
                        {deletingLeadId === activeLead.id ? "Removing..." : "Delete lead"}
                      </button>
                    </div>

                    {leadError ? (
                      <p className="rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                        {leadError}
                      </p>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        ["Email", activeLead.email],
                        ["Phone", activeLead.phone || "Not provided"],
                        ["Region", activeLead.region || "Not provided"],
                        ["Estimated budget", activeLead.estimatedBudget || "Not provided"],
                        ["Film for", activeLead.filmFor],
                        ["Relationship", activeLead.relationship],
                        ["Still living", activeLead.stillLiving || "Not provided"],
                        ["Timeline", activeLead.timeline || "Not provided"],
                        ["Location", activeLead.filmingLocation || "Not provided"],
                        ["Faith / values", activeLead.faithContext || "Not provided"],
                      ].map(([label, value]) => (
                        <div key={label} className="panel rounded-[1rem] p-4">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                            {label}
                          </p>
                          <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-primary)]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3">
                      <div className="panel rounded-[1rem] p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          Story context
                        </p>
                        <p className="mt-2 text-[0.94rem] leading-7 text-[var(--text-primary)]">
                          {activeLead.storyImportance}
                        </p>
                      </div>

                      <div className="panel rounded-[1rem] p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                          Additional notes
                        </p>
                        <p className="mt-2 text-[0.92rem] leading-7 text-[var(--text-primary)]">
                          {activeLead.extraNotes || "No additional notes submitted."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="archive-chip rounded-[1.2rem] px-4 py-4 text-[0.92rem] leading-6 text-[var(--text-secondary)]">
                    No lead selected.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "media" ? (
            <div className="grid gap-4">
              {Object.entries(mediaGroups).map(([pageLabel, slots]) => (
                <div key={pageLabel} className="panel-strong rounded-[1.7rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                        {pageLabel}
                      </p>
                      <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-secondary)]">
                        Upload or replace the image slot used in that page's current screen states.
                      </p>
                    </div>
                    <span className="archive-chip rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      {slots.length} slots
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {slots.map((slot) => (
                      <form
                        key={slot.id}
                        className="panel rounded-[1.35rem] p-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const fileInput = event.currentTarget.elements.namedItem(
                            `file-${slot.id}`,
                          ) as HTMLInputElement | null;
                          handleMediaUpload(slot.id, fileInput?.files?.[0] ?? null);
                        }}
                      >
                          <div className="film-frame relative aspect-[3/2] w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slot.src}
                            alt={slot.alt}
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition:
                                mediaObjectPositions[slot.id] ?? slot.objectPosition,
                            }}
                          />
                          <div className="media-caption absolute inset-x-3 bottom-3 rounded-[1rem] px-3.5 py-3">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                              {slot.label}
                            </p>
                            <p className="mt-2 text-[0.84rem] leading-6 text-[var(--text-primary)]">
                              {slot.isCustom
                                ? `Custom image set by ${slot.updatedBy ?? "admin"}`
                                : "Using the built-in fallback image."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                              Slot ID
                            </p>
                            <p className="mt-2 text-[0.86rem] leading-6 text-[var(--text-secondary)]">
                              {slot.id}
                            </p>
                          </div>

                          <p className="text-[0.86rem] leading-6 text-[var(--text-secondary)]">
                            {slot.description}
                          </p>

                          {slot.updatedAt ? (
                            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                              Updated {formatTimestamp(slot.updatedAt)}
                            </p>
                          ) : null}

                          <div className="space-y-1.5">
                            <label className="field-label" htmlFor={`file-${slot.id}`}>
                              Replace image
                            </label>
                            <input
                              id={`file-${slot.id}`}
                              name={`file-${slot.id}`}
                              type="file"
                              accept="image/*,.svg"
                              className="field-input file:mr-3 file:rounded-full file:border-0 file:bg-white/84 file:px-3 file:py-1.5 file:text-[0.78rem] file:font-medium file:text-[var(--text-primary)]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="field-label" htmlFor={`object-position-${slot.id}`}>
                              Framing
                            </label>
                            <select
                              id={`object-position-${slot.id}`}
                              className="field-select"
                              value={mediaObjectPositions[slot.id] ?? slot.objectPosition}
                              onChange={(event) =>
                                setMediaObjectPositions((current) => ({
                                  ...current,
                                  [slot.id]: event.target.value,
                                }))
                              }
                            >
                              {mediaObjectPositionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {uploadErrors[slot.id] ? (
                            <p className="rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.84rem] leading-6 text-[var(--text-primary)]">
                              {uploadErrors[slot.id]}
                            </p>
                          ) : null}

                          <button
                            type="submit"
                            className="button-primary"
                            disabled={
                              uploadingSlotId === slot.id ||
                              removingSlotId === slot.id ||
                              savingObjectPositionSlotId === slot.id
                            }
                          >
                            {uploadingSlotId === slot.id ? "Uploading..." : "Save image"}
                          </button>

                          <button
                            type="button"
                            className="button-secondary"
                            disabled={
                              !slot.isCustom ||
                              savingObjectPositionSlotId === slot.id ||
                              uploadingSlotId === slot.id ||
                              removingSlotId === slot.id
                            }
                            onClick={() => handleMediaObjectPositionSave(slot.id)}
                          >
                            {savingObjectPositionSlotId === slot.id
                              ? "Saving framing..."
                              : "Save framing"}
                          </button>

                          {slot.isCustom ? (
                            <button
                              type="button"
                              className="button-secondary"
                              disabled={
                                removingSlotId === slot.id ||
                                uploadingSlotId === slot.id ||
                                savingObjectPositionSlotId === slot.id
                              }
                              onClick={() => handleMediaRemove(slot.id)}
                            >
                              {removingSlotId === slot.id ? "Removing..." : "Remove photo"}
                            </button>
                          ) : null}
                        </div>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "content" ? (
            <AdminContentEditor initialContent={initialSiteContent} />
          ) : null}

          {activeTab === "settings" ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.78fr)]">
              <form className="panel-strong rounded-[1.7rem] p-5 sm:p-6" onSubmit={handleSettingsSubmit}>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  Account settings
                </p>
                <h2 className="mt-2 text-[1.7rem] leading-[0.98]">
                  Change username or password.
                </h2>
                <p className="mt-3 max-w-[32rem] text-[0.94rem] leading-7 text-[var(--text-secondary)]">
                  This starter implementation keeps both temporary admin accounts inside the app and
                  lets each signed-in admin update their own credentials cleanly.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="field-label" htmlFor="settings-username">
                      Username
                    </label>
                    <input
                      id="settings-username"
                      className="field-input"
                      value={settingsUsername}
                      onChange={(event) => setSettingsUsername(event.target.value)}
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="field-label" htmlFor="settings-current-password">
                      Current password
                    </label>
                    <input
                      id="settings-current-password"
                      type="password"
                      className="field-input"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="field-label" htmlFor="settings-new-password">
                      New password
                    </label>
                    <input
                      id="settings-new-password"
                      type="password"
                      className="field-input"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="field-label" htmlFor="settings-confirm-password">
                      Confirm new password
                    </label>
                    <input
                      id="settings-confirm-password"
                      type="password"
                      className="field-input"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {settingsError ? (
                  <p className="mt-4 rounded-[1rem] border border-[rgba(199,116,116,0.2)] bg-[rgba(255,255,255,0.52)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                    {settingsError}
                  </p>
                ) : null}

                {settingsSuccess ? (
                  <p className="mt-4 rounded-[1rem] border border-white/72 bg-[rgba(255,255,255,0.56)] px-3.5 py-3 text-[0.88rem] leading-6 text-[var(--text-primary)]">
                    {settingsSuccess}
                  </p>
                ) : null}

                <button className="button-primary mt-5" disabled={isSavingSettings} type="submit">
                  {isSavingSettings ? "Saving..." : "Save account settings"}
                </button>
              </form>

              <div className="grid gap-4">
                <div className="archive-chip rounded-[1.4rem] px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Current account
                  </p>
                  <p className="mt-2 text-[0.92rem] leading-6 text-[var(--text-primary)]">
                    {currentAdmin.username}
                  </p>
                  <p className="mt-2 text-[0.84rem] leading-6 text-[var(--text-secondary)]">
                    Last updated {formatTimestamp(currentAdmin.updatedAt)}
                  </p>
                </div>

                <div className="panel rounded-[1.4rem] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">
                    Starter auth model
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-7 text-[var(--text-secondary)]">
                    Credentials are stored in the app's persistent storage layer, passwords are
                    hashed, and the session is handled with an HTTP-only signed cookie so the
                    dashboard can stay lightweight while remaining upgradeable.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
