"use client";

import { createContext, useContext, type ReactNode } from "react";

const ImmersiveScrollContext = createContext(false);

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
