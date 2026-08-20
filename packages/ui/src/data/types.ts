/**
 * Отображательная модель листа персонажа (DTO).
 *
 * UI ничего не вычисляет по правилам GURPS: производные характеристики,
 * уровни умений и стоимости в очках приходят из источника данных уже
 * посчитанными (API поверх RulesEngine). Все числа — конечные значения
 * для отображения; числовые строки RulesEngine (Decimal) сериализуются
 * в обычные number на границе API.
 */

export interface CustomFieldDto {
  readonly id: string;
  readonly name: string;
  readonly value: string;
}

export interface CharacterProfileDto {
  readonly name: string;
  readonly title: string | null;
  readonly playerName: string | null;
  readonly campaign: string | null;
  readonly techLevel: string | null;
  readonly sizeModifier: number | null;
  readonly portraitUrl: string | null;
  readonly description: string | null;
  /** Пользовательские поля листа (рост, вес, вера, ...). */
  readonly customFields: readonly CustomFieldDto[];
}

export interface PrimaryAttributeDto {
  /** Техническое имя атрибута: "ST" | "DX" | "IQ" | "HT" | ... */
  readonly technicalName: string;
  readonly name: string;
  readonly value: number;
}

export interface SecondaryAttributeDto {
  /** Техническое имя: "HP" | "FP" | "will" | "per" | "speed" | "move" | ... */
  readonly technicalName: string;
  readonly name: string;
  readonly value: number;
  /** Короткая подпись под именем: «жизни», «воля», ... */
  readonly caption: string | null;
}

/** Интерактивный трекер ресурса (текущее значение — сессионное состояние UI). */
export interface ResourceTrackerDto {
  readonly technicalName: string;
  readonly name: string;
  readonly max: number;
  /** Нижняя граница трекера; null = 0. Для HP может быть отрицательной. */
  readonly min: number | null;
  readonly theme: "health" | "fatigue" | "mana";
}

export interface LiftLevelDto {
  readonly name: string;
  readonly weightKg: number;
}

export interface CombatStatsDto {
  /** Урон толчком, например "1d-3 cr". */
  readonly thrust: string;
  /** Урон замахом, например "1d+1 cr". */
  readonly swing: string;
  readonly dodge: number;
}

export type AttackDto = MeleeAttackDto | RangedAttackDto;

export interface MeleeAttackDto {
  readonly kind: "melee";
  readonly damage: string;
  readonly reach: string | null;
}

export interface RangedAttackDto {
  readonly kind: "ranged";
  readonly damage: string;
  readonly accuracy: number | null;
  readonly range: string | null;
  readonly rateOfFire: string | null;
  readonly recoil: number | null;
}

export type TraitKind = "advantage" | "disadvantage";

export interface TraitModifierDto {
  readonly name: string;
  /** Модификатор стоимости в процентах, например -40; null — описательный. */
  readonly costPercent: number | null;
}

export interface TraitDto {
  readonly kind: "trait";
  readonly id: string;
  /** Локализованное имя для отображения. */
  readonly name: string;
  /** Каноническое имя каталога (обычно английское); null — если совпадает. */
  readonly originalName: string | null;
  readonly traitKind: TraitKind;
  /** Итоговая стоимость в очках с учётом уровней и модификаторов; null — не отображается. */
  readonly points: number | null;
  /** Базовая стоимость: фиксированная или за уровень; null — неизвестна. */
  readonly basePoints: number | null;
  readonly levels: number | null;
  /** Самоконтроль (cr), например 12; null — нет проверки. */
  readonly selfControlRoll: number | null;
  readonly notes: string | null;
  /** Полное описание из каталога (для детального просмотра). */
  readonly description: string | null;
  /** Технические теги каталога: "racial", "mental", "combat", ... */
  readonly tags: readonly string[];
  readonly modifiers: readonly TraitModifierDto[];
  readonly attack: AttackDto | null;
}

export interface TraitContainerDto {
  readonly kind: "container";
  readonly id: string;
  readonly name: string;
  readonly note: string | null;
  readonly entries: readonly TraitEntryDto[];
}

export type TraitEntryDto = TraitDto | TraitContainerDto;

export type SkillDifficulty = "E" | "A" | "H" | "VH";

export interface SkillDto {
  readonly id: string;
  readonly name: string;
  readonly originalName: string | null;
  readonly specialization: string | null;
  /** Базовый атрибут, например "DX". */
  readonly attribute: string;
  readonly difficulty: SkillDifficulty;
  readonly points: number;
  /** Итоговый уровень умения — цель для броска 3d6. */
  readonly effectiveLevel: number;
  readonly notes: string | null;
  /** Технические теги каталога: "combat", "scouting", ... */
  readonly tags: readonly string[];
}

export interface SpellDto {
  readonly kind: "spell";
  readonly id: string;
  readonly name: string;
  readonly originalName: string | null;
  /** Класс заклинания: Regular, Area, Melee, Info, Special, ... */
  readonly spellClass: string;
  readonly castingCost: string;
  readonly castingTime: string;
  readonly points: number;
  /** Уровень заклинания — цель для броска 3d6; null — бросок вручную. */
  readonly effectiveLevel: number | null;
  readonly notes: string | null;
  /** Технические теги: "area", "healing", "utility", ... */
  readonly tags: readonly string[];
}

export interface SpellCollegeDto {
  readonly kind: "college";
  readonly id: string;
  readonly name: string;
  readonly spells: readonly SpellEntryDto[];
}

export type SpellEntryDto = SpellDto | SpellCollegeDto;

export type EquipmentState = "worn" | "carried" | "stored";

export interface EquipmentItemDto {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly weightKg: number | null;
  /** Цена в $; null — не указана. */
  readonly price: string | null;
  readonly state: EquipmentState;
  readonly notes: string | null;
}

export interface AnatomyZoneDto {
  readonly id: string;
  readonly hitLocationId: string;
  readonly label: string | null;
  /** Полигон в координатах канвы анатомии (см. AnatomyDto.canvas). */
  readonly polygon: readonly { readonly x: number; readonly y: number }[];
}

export interface HitLocationDto {
  readonly id: string;
  /** Локализованное имя для отображения. */
  readonly name: string;
  readonly originalName: string | null;
  /** Броски 3d6, попадающие в локацию; пусто — только прицельный бросок. */
  readonly hitOn: readonly number[];
  readonly description: string | null;
}

export interface AnatomyDto {
  readonly canvas: {
    readonly width: number;
    readonly height: number;
    readonly imageUrl: string | null;
  };
  readonly zones: readonly AnatomyZoneDto[];
  readonly hitLocations: readonly HitLocationDto[];
}

export interface CharacterSheetDto {
  readonly id: string;
  readonly profile: CharacterProfileDto;
  readonly attributes: {
    readonly primary: readonly PrimaryAttributeDto[];
    readonly secondary: readonly SecondaryAttributeDto[];
  };
  readonly trackers: readonly ResourceTrackerDto[];
  readonly liftLevels: readonly LiftLevelDto[];
  readonly combat: CombatStatsDto;
  readonly traits: readonly TraitEntryDto[];
  readonly skills: readonly SkillDto[];
  readonly spells: readonly SpellEntryDto[];
  readonly equipment: readonly EquipmentItemDto[];
  /** Анатомия с картой тела; null — карта не задана. */
  readonly anatomy: AnatomyDto | null;
  /** Общий бюджет персонажа в очках; потраченное UI суммирует по спискам. */
  readonly pointBudget: number;
}
