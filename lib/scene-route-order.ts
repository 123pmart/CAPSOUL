import { navigation } from "@/content/site";

export const sceneRouteOrder = navigation.map((item) => item.href);

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
  return navigation[currentIndex + offset] ?? null;
}

export function getSceneRouteLabel(pathname: string | null | undefined) {
  return (
    navigation.find((item) => isSceneRouteActive(pathname, item.href))?.label ?? "CAPSOUL"
  );
}
