"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ThemePath = "ascii" | "web2" | "newspaper" | "";

const ThemePathContext = createContext<ThemePath>("");

export function ThemePathProvider({
  themePath,
  children,
}: {
  themePath: ThemePath;
  children: ReactNode;
}) {
  return (
    <ThemePathContext.Provider value={themePath}>
      {children}
    </ThemePathContext.Provider>
  );
}

export function useThemePath(): ThemePath {
  return useContext(ThemePathContext);
}
