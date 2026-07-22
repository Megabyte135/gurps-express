import assert from "node:assert/strict";
import test from "node:test";
import type { Character } from "../../character/character.js";
import { CharacterFormulaResolver } from "../character-formula-resolver.js";

const computed = (value: string) => ({ value });

function createCharacter(): Character {
  return {
    attributes: {
      primary: [{ technicalName: "ST", value: computed("12") }],
      secondaryAdjustments: [],
    },
    skills: [{
      technicalName: "Melee",
      experience: "4",
      trainingModifier: computed("2"),
      value: computed("15"),
    }],
  } as Character;
}

test("CharacterFormulaResolver evaluates arithmetic precedence, powers, and parentheses", () => {
  const resolver = new CharacterFormulaResolver(createCharacter());

  assert.equal(resolver.resolve("1 + 2 * 3 ^ 2"), "19");
  assert.equal(resolver.resolve("(1 + 2) * 3 - 8 / 2"), "5");
});

test("CharacterFormulaResolver resolves attributes, skills, and skill fields", () => {
  const resolver = new CharacterFormulaResolver(createCharacter());

  assert.equal(resolver.resolve("attr.ST + skill.Melee"), "27");
  assert.equal(resolver.resolve("skill.Melee.trainingModifier + skill.Melee.experience"), "6");
  assert.equal(resolver.resolve("difficulty + 1", { difficulty: "-2" }), "-1");
});

test("CharacterFormulaResolver rejects malformed and unknown references", () => {
  const resolver = new CharacterFormulaResolver(createCharacter());

  assert.throws(() => resolver.resolve("attr.DX"), /Attribute DX was not found/);
  assert.throws(() => resolver.resolve("skill.Melee.level"), /not supported/);
  assert.throws(() => resolver.resolve("(1 + 2"), /not closed/);
});

test("CharacterFormulaResolver rejects duplicate technical names", () => {
  const character = createCharacter() as unknown as {
    attributes: { primary: readonly unknown[]; secondaryAdjustments: readonly unknown[] };
    skills: readonly unknown[];
  };
  character.skills = [
    { technicalName: "Melee", experience: "0", trainingModifier: computed("0"), value: computed("10") },
    { technicalName: "Melee", experience: "0", trainingModifier: computed("0"), value: computed("10") },
  ];

  assert.throws(() => new CharacterFormulaResolver(character as Character), /Duplicate skill technicalName/);
});
