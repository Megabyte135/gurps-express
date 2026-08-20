import { useTheme } from "../../hooks/theme";
import type { ThemeName } from "../../hooks/theme";
import type { IconName, IconProps, IconSet } from "./icon-kit";
import { baseSet } from "./base";
import { fantasySet } from "./fantasy";
import { scifiSet } from "./scifi";

const SETS: Readonly<Record<ThemeName, IconSet>> = {
  base: baseSet,
  fantasy: fantasySet,
  scifi: scifiSet,
};

export function Icon({ name, size, className }: { readonly name: IconName } & IconProps) {
  const { theme } = useTheme();
  const Renderer = (SETS[theme] ?? baseSet)[name];
  return <Renderer size={size} className={className} />;
}

export type { IconName } from "./icon-kit";
