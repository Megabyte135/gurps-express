import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "ge.ui.collapsed.v1";

interface CollapsedContextValue {
  isCollapsed(id: string, defaultCollapsed: boolean): boolean;
  toggle(id: string, defaultCollapsed: boolean): void;
}

const CollapsedContext = createContext<CollapsedContextValue | null>(null);

function readCollapsed(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function CollapsedProvider({ children }: { readonly children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(readCollapsed);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      /* хранилище недоступно — состояние останется в памяти */
    }
  }, [collapsed]);

  const isCollapsed = useCallback(
    (id: string, defaultCollapsed: boolean) => collapsed[id] ?? defaultCollapsed,
    [collapsed],
  );

  const toggle = useCallback((id: string, defaultCollapsed: boolean) => {
    setCollapsed((previous) => ({ ...previous, [id]: !(previous[id] ?? defaultCollapsed) }));
  }, []);

  const value = useMemo<CollapsedContextValue>(() => ({ isCollapsed, toggle }), [isCollapsed, toggle]);

  return <CollapsedContext.Provider value={value}>{children}</CollapsedContext.Provider>;
}

export function useCollapsed(): CollapsedContextValue {
  const context = useContext(CollapsedContext);
  if (context === null) throw new Error("useCollapsed must be used within CollapsedProvider");
  return context;
}
