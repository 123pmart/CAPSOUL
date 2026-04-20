import type { GlobalSiteContent } from "@/lib/site-content-schema";

export type SceneRouteKey = "home" | "experience" | "process" | "preserve" | "inquire";

type SceneRouteEntry = {
  key: SceneRouteKey;
  href: string;
};

type SceneRouteEntryWithLabel = SceneRouteEntry & {
  label: string;
};

type SceneRouteLabels = GlobalSiteContent["navigation"];

const defaultSceneRouteLabels: SceneRouteLabels = {
  home: "Home",
  experience: "The Experience",
  process: "How It Works",
  preserve: "What We Preserve",
  inquire: "Inquire",
};

export const sceneRouteEntries: SceneRouteEntry[] = [
  { key: "home", href: "/" },
  { key: "experience", href: "/the-experience" },
  { key: "process", href: "/how-it-works" },
  { key: "preserve", href: "/what-we-preserve" },
  { key: "inquire", href: "/inquire" },
];

export const sceneRouteOrder = sceneRouteEntries.map((item) => item.href);
export const sceneRouteCount = sceneRouteEntries.length;

function resolveSceneRouteLabels(labels?: Partial<SceneRouteLabels> | null): SceneRouteLabels {
  return {
    ...defaultSceneRouteLabels,
    ...(labels ?? {}),
  };
}

function withLabel(
  entry: SceneRouteEntry | null,
  labels?: Partial<SceneRouteLabels> | null,
): SceneRouteEntryWithLabel | null {
  if (!entry) {
    return null;
  }

  const resolvedLabels = resolveSceneRouteLabels(labels);
  return {
    ...entry,
    label: resolvedLabels[entry.key],
  };
}

export function normalizeSceneRoute(pathname: string | null | undefined) {
  if (!pathname) {
    return "/";
  }

  const strippedPath = pathname.split(/[?#]/)[0] ?? "/";

  if (!strippedPath || strippedPath === "/") {
    return "/";
  }

  return strippedPath.replace(/\/+$/, "") || "/";
}

export function isSceneRouteActive(pathname: string | null | undefined, href: string) {
  return normalizeSceneRoute(pathname) === normalizeSceneRoute(href);
}

export function getSceneRouteIndex(pathname: string | null | undefined) {
  return sceneRouteOrder.indexOf(normalizeSceneRoute(pathname));
}

export function getAdjacentSceneRoute(
  pathname: string | null | undefined,
  direction: "next" | "previous",
  labels?: Partial<SceneRouteLabels> | null,
) {
  const currentIndex = getSceneRouteIndex(pathname);

  if (currentIndex === -1) {
    return null;
  }

  const offset = direction === "next" ? 1 : -1;
  return withLabel(sceneRouteEntries[currentIndex + offset] ?? null, labels);
}

export function getSceneRouteLabel(
  pathname: string | null | undefined,
  labels?: Partial<SceneRouteLabels> | null,
) {
  return withLabel(
    sceneRouteEntries.find((item) => isSceneRouteActive(pathname, item.href)) ?? null,
    labels,
  )?.label ?? "CAPSOUL";
}

export function getSceneRouteEntry(
  pathname: string | null | undefined,
  labels?: Partial<SceneRouteLabels> | null,
) {
  return withLabel(
    sceneRouteEntries.find((item) => isSceneRouteActive(pathname, item.href)) ?? null,
    labels,
  );
}

export function getSceneRouteProgress(pathname: string | null | undefined) {
  const index = getSceneRouteIndex(pathname);

  if (index === -1) {
    return null;
  }

  return {
    current: index + 1,
    total: sceneRouteCount,
  };
}
