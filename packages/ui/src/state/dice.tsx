import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { DiceRoller } from "@gurps-express/rules-engine";
import type { DiceRollResult, SuccessRollResult } from "@gurps-express/rules-engine";

const roller = new DiceRoller();
const HISTORY_LIMIT = 14;
const TUMBLE_DURATION_MS = 460;
const TUMBLE_TICK_MS = 70;

export type DiceMode = "success" | "expression";

export interface DiceHistoryEntry {
  readonly id: number;
  readonly label: string;
  readonly dice: readonly number[];
  readonly total: number;
  readonly margin: number | null;
  readonly outcome: "success" | "failure" | null;
}

export interface CurrentSuccessRoll {
  readonly kind: "success";
  readonly label: string;
  readonly target: number;
  readonly modifiers: string;
  readonly result: SuccessRollResult;
}

export type CurrentExpressionRoll = {
  readonly kind: "expression";
  readonly label: string;
  readonly expression: string;
  readonly result: DiceRollResult;
  readonly purpose: "damage" | "hit-location" | "free";
};

export type CurrentRoll = CurrentSuccessRoll | CurrentExpressionRoll;

interface DiceState {
  readonly sidebarOpen: boolean;
  readonly mode: DiceMode;
  readonly label: string;
  readonly targetText: string;
  readonly modifiersText: string;
  readonly expressionText: string;
  readonly current: CurrentRoll | null;
  readonly rolling: boolean;
  readonly rollingValues: readonly number[];
  readonly selectedDice: readonly number[];
  readonly history: readonly DiceHistoryEntry[];
  readonly error: string | null;
}

export interface DiceContextValue {
  readonly sidebarOpen: boolean;
  readonly mode: DiceMode;
  readonly label: string;
  readonly targetText: string;
  readonly modifiersText: string;
  readonly expressionText: string;
  readonly current: CurrentRoll | null;
  readonly rolling: boolean;
  readonly rollingValues: readonly number[];
  readonly selectedDice: readonly number[];
  readonly history: readonly DiceHistoryEntry[];
  readonly error: string | null;
  toggleSidebar(): void;
  closeSidebar(): void;
  setMode(mode: DiceMode): void;
  setTargetText(text: string): void;
  setModifiersText(text: string): void;
  setExpressionText(text: string): void;
  requestSuccessRoll(label: string, target: number | null): void;
  submitSuccessRoll(): void;
  submitExpressionRoll(): void;
  requestExpressionRoll(label: string, expression: string): void;
  requestHitLocationRoll(): void;
  toggleDie(index: number): void;
  rerollSelected(): void;
  clearHistory(): void;
}

const DiceContext = createContext<DiceContextValue | null>(null);

const INITIAL_STATE: DiceState = {
  sidebarOpen: typeof window !== "undefined" && window.innerWidth >= 1100,
  mode: "success",
  label: "",
  targetText: "",
  modifiersText: "",
  expressionText: "",
  current: null,
  rolling: false,
  rollingValues: [],
  selectedDice: [],
  history: [],
  error: null,
};

function toHistoryFields(result: SuccessRollResult | DiceRollResult) {
  return {
    dice: result.dice.map((die) => die.value),
    total: Number(result.total),
    margin: result.kind === "success" ? Number(result.margin) : null,
    outcome: result.kind === "success" ? result.outcome : null,
  };
}

function randomFace(): number {
  return 1 + Math.floor(Math.random() * 6);
}

export function DiceProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<DiceState>(INITIAL_STATE);
  const historyId = useRef(1);
  const tumbleTimeout = useRef<number | null>(null);
  const tumbleInterval = useRef<number | null>(null);

  const stopTumble = useCallback(() => {
    if (tumbleTimeout.current !== null) {
      window.clearTimeout(tumbleTimeout.current);
      tumbleTimeout.current = null;
    }
    if (tumbleInterval.current !== null) {
      window.clearInterval(tumbleInterval.current);
      tumbleInterval.current = null;
    }
  }, []);

  useEffect(() => stopTumble, [stopTumble]);

  const startTumble = useCallback(
    (dieCount: number) => {
      stopTumble();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setState((previous) => ({
        ...previous,
        rolling: true,
        rollingValues: Array.from({ length: dieCount }, randomFace),
      }));
      tumbleInterval.current = window.setInterval(() => {
        setState((previous) =>
          previous.rolling ? { ...previous, rollingValues: previous.rollingValues.map(randomFace) } : previous,
        );
      }, TUMBLE_TICK_MS);
      tumbleTimeout.current = window.setTimeout(() => {
        stopTumble();
        setState((previous) => ({ ...previous, rolling: false }));
      }, TUMBLE_DURATION_MS);
    },
    [stopTumble],
  );

  const applyResult = useCallback(
    (current: CurrentRoll, historyLabel?: string) => {
      const entry: DiceHistoryEntry = {
        id: historyId.current++,
        label: historyLabel ?? current.label,
        ...toHistoryFields(current.result),
      };
      setState((previous) => ({
        ...previous,
        current,
        selectedDice: [],
        error: null,
        history: [entry, ...previous.history].slice(0, HISTORY_LIMIT),
      }));
      startTumble(current.result.dice.length);
    },
    [startTumble],
  );

  const requestSuccessRoll = (label: string, target: number | null) => {
    setState((previous) => ({
      ...previous,
      sidebarOpen: true,
      mode: "success",
      label,
      targetText: target === null ? "" : String(target),
      modifiersText: "",
      selectedDice: [],
      error: null,
    }));
    if (target === null) return;
    const outcome = roller.rollSuccess(String(target));
    if (!outcome.ok) {
      setState((previous) => ({ ...previous, current: null, error: outcome.error.message }));
      return;
    }
    applyResult({ kind: "success", label, target, modifiers: "", result: outcome.value });
  };

  const submitSuccessRoll = () => {
    const targetText = state.targetText.trim();
    const target = Number(targetText);
    if (targetText === "" || !Number.isInteger(target)) {
      setState((previous) => ({ ...previous, error: "Укажите целое число — цель броска." }));
      return;
    }
    const modifiers = state.modifiersText.trim();
    const outcome = roller.rollSuccess(String(target), modifiers);
    if (!outcome.ok) {
      setState((previous) => ({ ...previous, current: null, error: outcome.error.message }));
      return;
    }
    applyResult({
      kind: "success",
      label: state.label === "" ? "Проверка" : state.label,
      target,
      modifiers,
      result: outcome.value,
    });
  };

  const submitExpressionRoll = () => {
    const expression = state.expressionText.trim();
    if (expression === "") {
      setState((previous) => ({ ...previous, error: "Введите выражение, например 2d+1." }));
      return;
    }
    const outcome = roller.roll(expression);
    if (!outcome.ok) {
      setState((previous) => ({ ...previous, current: null, error: outcome.error.message }));
      return;
    }
    applyResult({
      kind: "expression",
      label: expression,
      expression,
      result: outcome.value,
      purpose: "free",
    });
  };

  const requestExpressionRoll = (label: string, expression: string) => {
    requestExpressionRollInner(label, expression, "damage");
  };

  const requestHitLocationRoll = () => {
    requestExpressionRollInner("Локация попадания", "3d", "hit-location");
  };

  function requestExpressionRollInner(
    label: string,
    expression: string,
    purpose: "damage" | "hit-location" | "free",
  ) {
    setState((previous) => ({
      ...previous,
      sidebarOpen: true,
      mode: "expression",
      label,
      selectedDice: [],
      error: null,
    }));
    const outcome = roller.roll(expression);
    if (!outcome.ok) {
      setState((previous) => ({
        ...previous,
        expressionText: expression,
        current: null,
        error: outcome.error.message,
      }));
      return;
    }
    applyResult({ kind: "expression", label, expression, result: outcome.value, purpose });
  }

  const rerollSelected = () => {
    const current = state.current;
    if (current === null || state.selectedDice.length === 0) return;
    const outcome = roller.reroll(current.result, state.selectedDice);
    if (!outcome.ok) {
      setState((previous) => ({ ...previous, error: outcome.error.message }));
      return;
    }
    const next: CurrentRoll =
      current.kind === "success"
        ? { ...current, result: outcome.value as SuccessRollResult }
        : { ...current, result: outcome.value as DiceRollResult };
    applyResult(next, `${next.label} · переброс`);
  };

  const value: DiceContextValue = {
    ...state,
    toggleSidebar: () => setState((previous) => ({ ...previous, sidebarOpen: !previous.sidebarOpen })),
    closeSidebar: () => setState((previous) => ({ ...previous, sidebarOpen: false })),
    setMode: (mode) => setState((previous) => ({ ...previous, mode, error: null })),
    setTargetText: (text) => setState((previous) => ({ ...previous, targetText: text })),
    setModifiersText: (text) => setState((previous) => ({ ...previous, modifiersText: text })),
    setExpressionText: (text) => setState((previous) => ({ ...previous, expressionText: text })),
    requestSuccessRoll,
    submitSuccessRoll,
    submitExpressionRoll,
    requestExpressionRoll,
    requestHitLocationRoll,
    toggleDie: (index) =>
      setState((previous) => ({
        ...previous,
        selectedDice: previous.selectedDice.includes(index)
          ? previous.selectedDice.filter((item) => item !== index)
          : [...previous.selectedDice, index],
      })),
    rerollSelected,
    clearHistory: () => setState((previous) => ({ ...previous, history: [] })),
  };

  return <DiceContext.Provider value={value}>{children}</DiceContext.Provider>;
}

export function useDice(): DiceContextValue {
  const context = useContext(DiceContext);
  if (context === null) throw new Error("useDice must be used within DiceProvider");
  return context;
}

/** Выделяет кубовую часть строки урона: "1d-3 cr" -> "1d-3", "1d burn" -> "1d". */
export function parseDamageDice(damage: string): string | null {
  const match = damage.match(/\d+d\d*(?:\s*[+-]\s*\d+)?/);
  return match === null ? null : match[0].replace(/\s+/g, "");
}
