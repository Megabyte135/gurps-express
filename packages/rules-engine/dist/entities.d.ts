/** Canonical decimal text. It is parsed and validated at the system boundary. */
export type Decimal = string;
/** UUID string identifying an entity embedded in an aggregate. */
export type EntityId = string;
/** Opaque identifier supplied by the identity provider. */
export type UserId = string;
/** JSON accepted in ruleset-owned extension points after schema validation. */
export type JsonValue = boolean | null | number | string | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
/** JSON Schema is intentionally data-only so the engine stays platform independent. */
export type JsonSchema = Readonly<Record<string, JsonValue>>;
export interface RulesetRef {
    readonly key: string;
    readonly version: string;
    readonly checksum: string;
}
export interface DefinitionRef {
    readonly id: string;
    readonly revision: string;
}
export interface RulesetSource {
    readonly kind: "package";
    readonly uri: string;
}
export interface RulesetManifest extends RulesetRef {
    readonly engineVersion: string;
    readonly source: RulesetSource;
}
export interface CatalogDefinition {
    readonly id: string;
    readonly revision: string;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
}
export type TraitCategory = "advantage" | "disadvantage" | "perk" | "quirk" | "skill" | "spell" | "template" | "racialTrait" | "language";
export type AcquisitionMode = "level" | "points";
export interface AcquisitionRule {
    readonly mode: AcquisitionMode;
    readonly minimum: Decimal;
    readonly maximum: Decimal | null;
    readonly increment: Decimal;
}
/** A declarative prerequisite. Evaluation belongs to the ruleset implementation. */
export type Prerequisite = {
    readonly kind: "all";
    readonly prerequisites: readonly Prerequisite[];
} | {
    readonly kind: "any";
    readonly prerequisites: readonly Prerequisite[];
} | {
    readonly kind: "not";
    readonly prerequisite: Prerequisite;
} | {
    readonly kind: "attribute";
    readonly attribute: AttributeKey;
    readonly minimum: Decimal;
} | {
    readonly kind: "trait";
    readonly definitionId: string;
    readonly minimumLevel?: Decimal;
} | {
    readonly kind: "tag";
    readonly tag: string;
};
export interface TraitDefinition extends CatalogDefinition {
    readonly kind: "trait";
    readonly category: TraitCategory;
    readonly acquisition: readonly AcquisitionRule[];
    readonly selectionsSchema: JsonSchema;
    readonly prerequisites: readonly Prerequisite[];
    readonly modifierIds: readonly string[];
}
export interface SkillDefinition extends TraitDefinition {
    readonly category: "skill";
    readonly governingAttribute: "DX" | "IQ" | "HT" | "Will" | "Per";
    readonly difficulty: "easy" | "average" | "hard" | "veryHard";
    readonly defaults: readonly SkillDefault[];
}
export type SkillDefault = {
    readonly kind: "attribute";
    readonly attribute: "DX" | "IQ" | "HT" | "Will" | "Per";
    readonly value: Decimal;
} | {
    readonly kind: "skill";
    readonly definitionId: string;
    readonly value: Decimal;
};
export interface SpellDefinition extends TraitDefinition {
    readonly category: "spell";
    readonly colleges: readonly string[];
    readonly castingTime: Decimal;
    readonly duration: Decimal | null;
    readonly baseCost: Decimal;
    readonly maintenanceCost: Decimal | null;
}
export interface TraitModifierDefinition extends CatalogDefinition {
    readonly kind: "traitModifier";
    readonly appliesTo: readonly TraitCategory[];
    readonly selectionsSchema: JsonSchema;
    readonly prerequisites: readonly Prerequisite[];
    readonly stacking: "unique" | "repeatable";
}
export interface WeaponModeDefinition {
    readonly id: string;
    readonly name: string;
    readonly usage: "melee" | "ranged";
    readonly skillDefinitionId: string;
    readonly damage: string;
    readonly damageType: string;
    readonly reach: string | null;
    readonly accuracy: Decimal | null;
    readonly range: string | null;
    readonly rateOfFire: string | null;
    readonly shots: string | null;
    readonly bulk: Decimal | null;
}
export interface ArmorDefinition {
    readonly damageResistance: Decimal;
    readonly locations: readonly string[];
}
export interface EquipmentDefinition extends CatalogDefinition {
    readonly kind: "equipment";
    readonly weight: Decimal;
    readonly price: Decimal;
    readonly configurationSchema: JsonSchema;
    readonly isContainer: boolean;
    readonly capacity: Decimal | null;
    readonly isUnique: boolean;
    readonly weaponModes: readonly WeaponModeDefinition[];
    readonly armor: ArmorDefinition | null;
}
export interface ConditionDefinition extends CatalogDefinition {
    readonly kind: "condition";
    readonly configurationSchema: JsonSchema;
}
export interface RulesetCatalog {
    readonly traits: readonly TraitDefinition[];
    readonly traitModifiers: readonly TraitModifierDefinition[];
    readonly equipment: readonly EquipmentDefinition[];
    readonly conditions: readonly ConditionDefinition[];
}
export interface Ruleset {
    readonly manifest: RulesetManifest;
    readonly catalog: RulesetCatalog;
}
export type CharacterStatus = "draft" | "valid" | "archived";
export type CharacterKind = "pc" | "npc";
export type AttributeKey = "ST" | "DX" | "IQ" | "HT" | "HP" | "Will" | "Per" | "FP" | "BasicSpeed" | "BasicMove";
export type PrimaryAttributeKey = "ST" | "DX" | "IQ" | "HT";
export type SecondaryAttributeKey = "HP" | "Will" | "Per" | "FP" | "BasicSpeed" | "BasicMove";
export interface CharacterIdentity {
    readonly name: string;
    readonly aliases: readonly string[];
    readonly description: string;
    readonly appearance: string;
    readonly biography: string;
}
export interface CharacterBuild {
    readonly kind: CharacterKind;
    readonly pointBudget: Decimal | null;
    readonly techLevel: Decimal | null;
}
export interface CharacterAttributes {
    readonly primary: Readonly<Record<PrimaryAttributeKey, Decimal>>;
    readonly secondaryAdjustments: Readonly<Record<SecondaryAttributeKey, Decimal>>;
}
export interface TraitModifierInstance {
    readonly id: EntityId;
    readonly definitionRef: DefinitionRef;
    readonly enabled: boolean;
    readonly selections: Readonly<Record<string, JsonValue>>;
}
export interface TraitInstance {
    readonly id: EntityId;
    readonly category: TraitCategory;
    readonly definitionRef: DefinitionRef;
    readonly acquisition: {
        readonly mode: AcquisitionMode;
        readonly value: Decimal;
    };
    readonly selections: Readonly<Record<string, JsonValue>>;
    readonly modifiers: readonly TraitModifierInstance[];
    readonly notes: string;
}
export interface CatalogEquipmentInstance {
    readonly id: EntityId;
    readonly source: "catalog";
    readonly definitionRef: DefinitionRef;
    readonly quantity: number;
    readonly containerItemId: EntityId | null;
    readonly configuration: Readonly<Record<string, JsonValue>>;
    readonly notes: string;
}
export interface CustomEquipmentInstance {
    readonly id: EntityId;
    readonly source: "custom";
    readonly custom: {
        readonly name: string;
        readonly weight: Decimal;
        readonly price: Decimal;
        readonly description: string;
    };
    readonly quantity: number;
    readonly containerItemId: EntityId | null;
    readonly notes: string;
}
export type EquipmentInstance = CatalogEquipmentInstance | CustomEquipmentInstance;
export interface Loadout {
    readonly id: EntityId;
    readonly name: string;
    readonly itemIds: readonly EntityId[];
    readonly slots: readonly {
        readonly slot: string;
        readonly itemId: EntityId;
    }[];
}
/** Authoritative editable input. It deliberately contains no calculated or runtime fields. */
export interface CharacterSheet {
    readonly id: string;
    readonly revision: number;
    readonly ownerId: UserId;
    readonly rulesetRef: RulesetRef;
    readonly status: CharacterStatus;
    readonly identity: CharacterIdentity;
    readonly build: CharacterBuild;
    readonly attributes: CharacterAttributes;
    readonly traits: readonly TraitInstance[];
    readonly equipment: readonly EquipmentInstance[];
    readonly loadouts: readonly Loadout[];
    readonly notes: {
        readonly public: string;
        readonly private: string;
    };
}
export interface RuntimeResource {
    readonly current: Decimal;
    readonly maximum: Decimal;
}
export interface RuntimeCondition {
    readonly id: EntityId;
    readonly definitionRef: DefinitionRef;
    readonly sourceEventSequence: number;
    readonly configuration: Readonly<Record<string, JsonValue>>;
}
export interface CharacterRuntimeState {
    readonly characterRevision: number;
    readonly activeLoadoutId: EntityId | null;
    readonly resources: Readonly<Record<"HP" | "FP", RuntimeResource>>;
    readonly conditions: readonly RuntimeCondition[];
}
export interface SessionRuntimeState {
    readonly characters: Readonly<Record<string, CharacterRuntimeState>>;
}
export type CampaignStatus = "active" | "archived";
export interface Campaign {
    readonly id: string;
    readonly revision: number;
    readonly name: string;
    readonly rulesetRef: RulesetRef;
    readonly status: CampaignStatus;
    readonly settings: Readonly<Record<string, JsonValue>>;
}
export type SessionStatus = "planned" | "active" | "completed";
export interface GameSession {
    readonly id: string;
    readonly revision: number;
    readonly campaignId: string;
    readonly rulesetRef: RulesetRef;
    readonly status: SessionStatus;
    readonly startedAt: string | null;
    readonly endedAt: string | null;
    readonly lastSequence: number;
}
export interface SessionEventActor {
    readonly userId: UserId;
    readonly characterId: string | null;
}
/** Immutable result of a successfully applied game action. */
export interface SessionEvent {
    readonly sessionId: string;
    readonly sequence: number;
    readonly type: string;
    readonly schemaVersion: number;
    readonly actor: SessionEventActor;
    readonly payload: Readonly<Record<string, JsonValue>>;
    readonly result: Readonly<Record<string, JsonValue>>;
    readonly rulesetRef: RulesetRef;
}
export interface RuleViolation {
    readonly code: string;
    readonly path: string;
    readonly message: string;
    readonly details: Readonly<Record<string, JsonValue>>;
}
export interface AttributeCalculation {
    readonly base?: Decimal;
    readonly derived?: Decimal;
    readonly purchasedAdjustment?: Decimal;
    readonly modifiers: readonly {
        readonly source: string;
        readonly value: Decimal;
    }[];
    readonly final: Decimal;
}
export interface CharacterCalculation {
    readonly characterId: string;
    readonly forRevision: number;
    readonly rulesetRef: RulesetRef;
    readonly pointTotals: {
        readonly spent: Decimal;
        readonly byCategory: Readonly<Record<string, Decimal>>;
        readonly remaining: Decimal | null;
    };
    readonly attributes: Readonly<Record<AttributeKey, AttributeCalculation>>;
    readonly traits: readonly {
        readonly traitId: EntityId;
        readonly effectiveLevel: Decimal | null;
        readonly pointCost: Decimal;
    }[];
    readonly inventory: {
        readonly totalWeight: Decimal;
        readonly encumbrance: string;
    };
    readonly combat: {
        readonly move: Decimal;
        readonly dodge: Decimal;
        readonly attacks: readonly JsonValue[];
        readonly activeDefenses: readonly JsonValue[];
    };
    readonly violations: readonly RuleViolation[];
}
//# sourceMappingURL=entities.d.ts.map