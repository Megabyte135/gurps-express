import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ThemeName = "base" | "fantasy" | "scifi";
export type ThemeMode = "light" | "dark";

const STORAGE_THEME = "ge.ui.theme";
const STORAGE_MODE = "ge.ui.mode";

const THEME_NAMES: readonly ThemeName[] = ["base", "fantasy", "scifi"];
const THEME_MODES: readonly ThemeMode[] = ["light", "dark"];

interface ThemeContextValue {
  readonly theme: ThemeName;
  readonly mode: ThemeMode;
  setTheme(theme: ThemeName): void;
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored<T extends string>(key: string, allowed: readonly T[]): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return allowed.includes(raw as T) ? (raw as T) : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(
    () => readStored(STORAGE_THEME, THEME_NAMES) ?? "base",
  );
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = readStored(STORAGE_MODE, THEME_MODES);
    if (stored !== null) return stored;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
  }, [theme, mode]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_THEME, next);
    } catch {
      /* хранилище недоступно */
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_MODE, next);
    } catch {
      /* хранилище недоступно */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((previous) => {
      const next = previous === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_MODE, next);
      } catch {
        /* хранилище недоступно */
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, setTheme, setMode, toggleMode }),
    [theme, mode, setTheme, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
