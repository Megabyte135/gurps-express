import { useEffect, useState } from "react";
import type { CharacterSource } from "../data/character-source";
import type { CharacterSheetDto } from "../data/types";

export type CharacterLoadState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly sheet: CharacterSheetDto };

export function useCharacter(source: CharacterSource, id: string): CharacterLoadState {
  const [state, setState] = useState<CharacterLoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    source.getCharacter(id).then(
      (sheet) => {
        if (!cancelled) setState({ status: "ready", sheet });
      },
      (error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [source, id]);

  return state;
}
