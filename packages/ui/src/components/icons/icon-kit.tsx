import type { ReactNode } from "react";

export type IconName =
  | "dice"
  | "chevron"
  | "search"
  | "close"
  | "save"
  | "undo"
  | "redo"
  | "reset"
  | "sun"
  | "moon"
  | "palette"
  | "panel"
  | "edit";

export interface IconProps {
  readonly size?: number | undefined;
  readonly className?: string | undefined;
}

export type IconRenderer = (props: IconProps) => JSX.Element;

export type IconSet = Record<IconName, IconRenderer>;

export function makeIconSet(
  options: { readonly stroke: number; readonly caps: "round" | "square" },
  shapes: Readonly<Record<IconName, ReactNode>>,
): IconSet {
  const { stroke, caps } = options;
  const set = {} as Record<IconName, IconRenderer>;
  for (const name of Object.keys(shapes) as IconName[]) {
    const children = shapes[name];
    set[name] = ({ size = 16, className }: IconProps) => (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap={caps}
        strokeLinejoin={caps === "round" ? "round" : "miter"}
        aria-hidden="true"
      >
        {children}
      </svg>
    );
  }
  return set;
}
