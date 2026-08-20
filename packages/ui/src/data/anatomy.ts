import { createAnatomyFromBlueprint, humanoidBlueprint } from "@gurps-express/rules-engine";
import type { AnatomyBlueprint } from "@gurps-express/rules-engine";
import type { AnatomyDto, HitLocationDto } from "./types";

/**
 * Локализация канонических локаций гуманоида. Движок хранит технические
 * (английские) имена; отображаемые — забота UI. Неизвестные локации
 * показываются под техническим именем.
 */
const HUMANOID_L10N: Readonly<Record<string, { name: string; description: string | null }>> = {
  skull: { name: "Череп", description: "Голова за лицом; по броне черепа редко пробивают." },
  face: { name: "Лицо", description: "Передняя часть головы; серьёзные раны требуют проверки сбивания с ног." },
  eye: { name: "Глаз", description: "Только прицельный бросок (−9); особые правила ослепления." },
  neck: { name: "Шея", description: "Уязвим для дробящего и режущего урона; прицел −5." },
  torso: { name: "Торс", description: "Грудь и живот; цель по умолчанию без штрафа." },
  vitals: { name: "Жизненно важные органы", description: "Сердце и органы; модификатор раны ×2. Прицел −3." },
  groin: { name: "Пах", description: "Прицел −3; удвоенное сбивание с ног дробящим у мужчин." },
  "arm-right": { name: "Правая рука", description: "Выведена из строя при половине HP базового урона; прицел −2." },
  "arm-left": { name: "Левая рука", description: "Выведена из строя при половине HP базового урона; прицел −2." },
  hand: { name: "Кисть", description: "Любая кисть; выводится из строя при 1/3 HP. Прицел −4." },
  "leg-right": { name: "Правая нога", description: "Выведена из строя при половине HP базового урона; прицел −2." },
  "leg-left": { name: "Левая нога", description: "Выведена из строя при половине HP базового урона; прицел −2." },
  foot: { name: "Ступня", description: "Любая ступня; выводится из строя при 1/3 HP. Прицел −4." },
};

function mapBlueprint(blueprint: AnatomyBlueprint): AnatomyDto | null {
  const anatomyResult = createAnatomyFromBlueprint(blueprint);
  if (!anatomyResult.ok) return null;
  const anatomy = anatomyResult.value;

  const hitLocations: HitLocationDto[] = anatomy.hitLocations.map((location) => {
    const localized = HUMANOID_L10N[location.id];
    return {
      id: location.id,
      name: localized?.name ?? location.name,
      originalName: localized === undefined ? null : location.name,
      hitOn: [...location.hitOn],
      description: localized?.description ?? location.description,
    };
  });

  const map = anatomy.bodyMap;
  if (map === null) return null;

  return {
    canvas: { ...map.canvas },
    hitLocations,
    zones: map.zones.map((zone) => ({
      id: zone.id,
      hitLocationId: zone.hitLocationId,
      label: zone.label,
      polygon: zone.polygon.map((point) => ({ ...point })),
    })),
  };
}

/** Кукла гуманоида из пресета rules-engine (B556). */
export const humanoidAnatomy: AnatomyDto | null = mapBlueprint(humanoidBlueprint);
