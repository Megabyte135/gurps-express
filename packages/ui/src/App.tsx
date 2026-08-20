import { useCallback, useEffect, useMemo, useState } from "react";
import { createCharacterSource } from "./data/sources";
import { computeSpentPoints } from "./data/points";
import type { CharacterProfileDto } from "./data/types";
import { useCharacter } from "./hooks/use-character";
import { CollapsedProvider } from "./hooks/collapsed";
import { ThemeProvider } from "./hooks/theme";
import { DiceProvider, useDice } from "./state/dice";
import { Toolbar } from "./components/layout/Toolbar";
import { Sidebar } from "./components/layout/Sidebar";
import { HeroCard } from "./components/profile/HeroCard";
import { HeroTrackers } from "./components/attributes/HeroTrackers";
import { AttributesSection } from "./components/attributes/AttributesSection";
import { TraitSection } from "./components/traits/TraitSection";
import { SkillSection } from "./components/skills/SkillSection";
import { SpellSection } from "./components/spells/SpellSection";
import { EquipmentSection } from "./components/equipment/EquipmentSection";
import { SheetSkeleton } from "./components/common/Skeleton";

const CHARACTER_ID = "bes";

function SheetApp() {
  const source = useMemo(() => createCharacterSource(), []);
  const load = useCharacter(source, CHARACTER_ID);
  const dice = useDice();
  const [trackerCurrent, setTrackerCurrent] = useState<Readonly<Record<string, number>>>({});
  const [profileOverride, setProfileOverride] = useState<CharacterProfileDto | null>(null);
  const loadedSheet = load.status === "ready" ? load.sheet : null;

  /** Профиль с учётом локальных правок (сессионно, до появления API). */
  const sheet = useMemo(() => {
    if (loadedSheet === null) return null;
    return profileOverride === null ? loadedSheet : { ...loadedSheet, profile: profileOverride };
  }, [loadedSheet, profileOverride]);

  useEffect(() => {
    if (loadedSheet === null) return;
    setProfileOverride(null);
    setTrackerCurrent(
      Object.fromEntries(loadedSheet.trackers.map((tracker) => [tracker.technicalName, tracker.max])),
    );
  }, [loadedSheet]);

  const adjustTracker = useCallback(
    (technicalName: string, delta: number) => {
      setTrackerCurrent((previous) => {
        if (sheet === null) return previous;
        const tracker = sheet.trackers.find((item) => item.technicalName === technicalName);
        if (tracker === undefined) return previous;
        const min = tracker.min ?? 0;
        const value = previous[technicalName] ?? tracker.max;
        return { ...previous, [technicalName]: Math.max(min, Math.min(tracker.max, value + delta)) };
      });
    },
    [sheet],
  );

  const resetTracker = useCallback((technicalName: string) => {
    setTrackerCurrent((previous) => {
      if (sheet === null) return previous;
      const tracker = sheet.trackers.find((item) => item.technicalName === technicalName);
      if (tracker === undefined) return previous;
      return { ...previous, [technicalName]: tracker.max };
    });
  }, [sheet]);

  return (
    <div className="app">
      <Toolbar
        characterName={sheet === null ? null : sheet.profile.name}
        spentPoints={sheet === null ? null : computeSpentPoints(sheet)}
        pointBudget={sheet === null ? null : sheet.pointBudget}
        sidebarOpen={dice.sidebarOpen}
        onToggleSidebar={dice.toggleSidebar}
      />

      <div className={`app-body${dice.sidebarOpen ? " is-sidebar-open" : ""}`}>
        {dice.sidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Закрыть панель бросков"
            onClick={dice.closeSidebar}
          />
        )}

        <main className="content">
          {load.status === "loading" && <SheetSkeleton />}

          {load.status === "error" && (
            <div className="sheet-error">
              <p className="sheet-error-title">Не удалось загрузить персонажа</p>
              <p className="sheet-error-detail">{load.message}</p>
            </div>
          )}

          {sheet !== null && (
            <>
              <HeroCard profile={sheet.profile} onChange={setProfileOverride} />
              <HeroTrackers
                trackers={sheet.trackers}
                current={trackerCurrent}
                onAdjust={adjustTracker}
                onReset={resetTracker}
              />
              <AttributesSection sheet={sheet} />
              <TraitSection entries={sheet.traits} />
              <div className="columns-2">
                <SkillSection skills={sheet.skills} />
                <EquipmentSection equipment={sheet.equipment} />
              </div>
              <SpellSection spells={sheet.spells} />
            </>
          )}
        </main>

        <div className="sidebar-wrap">
          <Sidebar sheet={sheet} trackerCurrent={trackerCurrent} onAdjustTracker={adjustTracker} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CollapsedProvider>
        <DiceProvider>
          <SheetApp />
        </DiceProvider>
      </CollapsedProvider>
    </ThemeProvider>
  );
}
