"use client";

import { createContext, useContext, type ReactNode } from "react";

export const IMMERSIVE_SECTION_CHANGE_EVENT = "capsoul:immersive-section-change";
export const IMMERSIVE_SECTION_NAVIGATE_EVENT = "capsoul:immersive-section-navigate";

export const immersiveSectionRoutes = {
  home: "/",
  "the-experience": "/the-experience",
  "how-it-works": "/how-it-works",
  "what-we-preserve": "/what-we-preserve",
  inquire: "/inquire",
} as const;

export type ImmersiveSectionId = keyof typeof immersiveSectionRoutes;

export type ImmersiveSectionChangeDetail = {
  id: ImmersiveSectionId;
  index: number;
  label: string;
  href: string;
};

const ImmersiveScrollContext = createContext(false);

function normalizeRoute(value: string) {
  const path = value.split(/[?#]/)[0] ?? "/";
  return path.replace(/\/+$/, "") || "/";
}

export function isImmersiveSectionId(value: string): value is ImmersiveSectionId {
  return Object.prototype.hasOwnProperty.call(immersiveSectionRoutes, value);
}

export function getImmersiveRouteForSection(id: string) {
  return isImmersiveSectionId(id) ? immersiveSectionRoutes[id] : null;
}

export function getImmersiveSectionForRoute(href: string) {
  const normalizedHref = normalizeRoute(href);
  const match = Object.entries(immersiveSectionRoutes).find(
    ([, route]) => normalizeRoute(route) === normalizedHref,
  );

  return match?.[0] as ImmersiveSectionId | undefined;
}

export function dispatchImmersiveSectionChange(detail: ImmersiveSectionChangeDetail) {
  window.dispatchEvent(new CustomEvent(IMMERSIVE_SECTION_CHANGE_EVENT, { detail }));
}

export function dispatchImmersiveSectionNavigate(id: ImmersiveSectionId) {
  window.dispatchEvent(
    new CustomEvent(IMMERSIVE_SECTION_NAVIGATE_EVENT, {
      detail: { id },
    }),
  );
}

export function ImmersiveScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ImmersiveScrollContext.Provider value>
      {children}
    </ImmersiveScrollContext.Provider>
  );
}

export function useImmersiveScroll() {
  return useContext(ImmersiveScrollContext);
}
