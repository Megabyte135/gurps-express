import assert from "node:assert/strict";
import test from "node:test";
import type { Character } from "../../character/character.js";
import { CharacterFormulaResolver } from "../resolver.js";

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
  } as unknown as Character;
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
