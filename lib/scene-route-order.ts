import { navigation } from "@/content/site";

export const sceneRouteEntries = [...navigation];
export const sceneRouteOrder = sceneRouteEntries.map((item) => item.href);
export const sceneRouteCount = sceneRouteEntries.length;

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
) {
  const currentIndex = getSceneRouteIndex(pathname);

  if (currentIndex === -1) {
    return null;
  }

  const offset = direction === "next" ? 1 : -1;
  return sceneRouteEntries[currentIndex + offset] ?? null;
}

export function getSceneRouteLabel(pathname: string | null | undefined) {
  return (
    sceneRouteEntries.find((item) => isSceneRouteActive(pathname, item.href))?.label ?? "CAPSOUL"
  );
}

export function getSceneRouteEntry(pathname: string | null | undefined) {
  return sceneRouteEntries.find((item) => isSceneRouteActive(pathname, item.href)) ?? null;
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
