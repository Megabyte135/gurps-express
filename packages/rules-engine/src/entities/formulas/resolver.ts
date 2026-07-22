import type { Character } from "../character/character.js";
import type { Attribute } from "../character/attributes/attribute.js";
import type { Skill } from "../character/skills/skill.js";
import type { Decimal, Entity, TechnicalName } from "../common.js";
import {
  addDecimals,
  divideDecimals,
  multiplyDecimals,
  normalizeDecimal,
  powerDecimals,
  subtractDecimals,
} from "../decimal.js";
import type { FormulaResolver } from "../values/computed-value.js";
import type { Formula, FormulaContext } from "./formula.js";

/** Resolves formula expressions against one character's attributes and skills. */
export class CharacterFormulaResolver implements FormulaResolver {
  readonly #attributes: ReadonlyMap<TechnicalName, Attribute>;
  readonly #skills: ReadonlyMap<TechnicalName, Skill>;

  public constructor(character: Character) {
    this.#attributes = indexByTechnicalName([
      ...character.attributes.primary,
      ...character.attributes.secondaryAdjustments,
    ], "attribute");
    this.#skills = indexByTechnicalName(character.skills, "skill");
  }

  public resolve(formula: Formula, context: FormulaContext = {}): Decimal {
    return new FormulaParser(formula, (reference) => this.resolveReference(reference, context)).parse();
  }

  private resolveReference(reference: string, context: FormulaContext): Decimal {
    const parts = reference.split(".");
    if (parts[0] === "attr") {
      const technicalName = parts[1];
      if (parts.length !== 2 || technicalName === undefined) {
        throw new Error(`Invalid attribute reference: ${reference}.`);
      }
      const attribute = this.#attributes.get(technicalName);
      if (attribute === undefined) throw new Error(`Attribute ${technicalName} was not found.`);
      return attribute.value.value;
    }

    if (parts[0] === "skill") {
      const technicalName = parts[1];
      if (parts.length < 2 || parts.length > 3 || technicalName === undefined) {
        throw new Error(`Invalid skill reference: ${reference}.`);
      }
      const skill = this.#skills.get(technicalName);
      if (skill === undefined) throw new Error(`Skill ${technicalName} was not found.`);
      if (parts.length === 2) return skill.value.value;
      switch (parts[2]) {
        case "trainingModifier": return skill.trainingModifier.value;
        case "experience": return skill.experience;
        default: throw new Error(`Skill field ${parts[2]} is not supported.`);
      }
    }

    const value = context[reference];
    if (value === undefined) throw new Error(`Formula variable ${reference} was not provided.`);
    return normalizeDecimal(value);
  }
}

function indexByTechnicalName<T extends Entity>(
  entities: readonly T[],
  entityKind: string,
): ReadonlyMap<TechnicalName, T> {
  const index = new Map<TechnicalName, T>();
  for (const entity of entities) {
    if (index.has(entity.technicalName)) {
      throw new Error(`Duplicate ${entityKind} technicalName: ${entity.technicalName}.`);
    }
    index.set(entity.technicalName, entity);
  }
  return index;
}

type Token =
  | { readonly kind: "number"; readonly value: Decimal }
  | { readonly kind: "reference"; readonly value: string }
  | { readonly kind: "operator"; readonly value: "+" | "-" | "*" | "/" | "^" }
  | { readonly kind: "left-parenthesis" | "right-parenthesis" }
  | { readonly kind: "end" };

class FormulaParser {
  readonly #tokens: readonly Token[];
  readonly #resolveReference: (reference: string) => Decimal;
  #position = 0;

  public constructor(source: Formula, resolveReference: (reference: string) => Decimal) {
    this.#tokens = tokenize(source);
    this.#resolveReference = resolveReference;
  }

  public parse(): Decimal {
    const value = this.parseSum();
    if (this.current.kind !== "end") throw new Error("Unexpected token at the end of formula.");
    return value;
  }

  private parseSum(): Decimal {
    let value = this.parseProduct();
    while (this.current.kind === "operator" && (this.current.value === "+" || this.current.value === "-")) {
      const operation = this.current.value;
      this.#position += 1;
      const right = this.parseProduct();
      value = operation === "+" ? addDecimals(value, right) : subtractDecimals(value, right);
    }
    return value;
  }

  private parseProduct(): Decimal {
    let value = this.parseUnary();
    while (this.current.kind === "operator" && (this.current.value === "*" || this.current.value === "/")) {
      const operation = this.current.value;
      this.#position += 1;
      const right = this.parseUnary();
      value = operation === "*" ? multiplyDecimals(value, right) : divideDecimals(value, right);
    }
    return value;
  }

  private parseUnary(): Decimal {
    if (this.current.kind === "operator" && this.current.value === "+") {
      this.#position += 1;
      return this.parseUnary();
    }
    if (this.current.kind === "operator" && this.current.value === "-") {
      this.#position += 1;
      return subtractDecimals("0", this.parseUnary());
    }
    return this.parsePower();
  }

  private parsePower(): Decimal {
    const left = this.parsePrimary();
    if (this.current.kind !== "operator" || this.current.value !== "^") return left;
    this.#position += 1;
    return powerDecimals(left, this.parseUnary());
  }

  private parsePrimary(): Decimal {
    const token = this.current;
    if (token.kind === "number") {
      this.#position += 1;
      return normalizeDecimal(token.value);
    }
    if (token.kind === "reference") {
      this.#position += 1;
      return this.#resolveReference(token.value);
    }
    if (token.kind === "left-parenthesis") {
      this.#position += 1;
      const value = this.parseSum();
      if (this.current.kind !== "right-parenthesis") throw new Error("A formula parenthesis is not closed.");
      this.#position += 1;
      return value;
    }
    throw new Error("Expected a number, reference, or parenthesized expression.");
  }

  private get current(): Token {
    const token = this.#tokens[this.#position];
    if (token === undefined) throw new Error("Unexpected end of formula.");
    return token;
  }
}

function tokenize(source: Formula): readonly Token[] {
  const tokens: Token[] = [];
  let position = 0;
  while (position < source.length) {
    const character = source.charAt(position);
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }
    if ("+-*/^".includes(character)) {
      tokens.push({ kind: "operator", value: character as "+" | "-" | "*" | "/" | "^" });
      position += 1;
      continue;
    }
    if (character === "(") {
      tokens.push({ kind: "left-parenthesis" });
      position += 1;
      continue;
    }
    if (character === ")") {
      tokens.push({ kind: "right-parenthesis" });
      position += 1;
      continue;
    }
    const number = source.slice(position).match(/^\d+(?:\.\d+)?/);
    if (number !== null) {
      const value = number[0];
      if (value === undefined) throw new Error("A number token cannot be empty.");
      tokens.push({ kind: "number", value });
      position += value.length;
      continue;
    }
    const reference = source.slice(position).match(/^[A-Za-z_][A-Za-z0-9_.]*/);
    if (reference !== null) {
      const value = reference[0];
      if (value === undefined) throw new Error("A reference token cannot be empty.");
      tokens.push({ kind: "reference", value });
      position += value.length;
      continue;
    }
    throw new Error(`Unexpected character in formula: ${character}.`);
  }
  tokens.push({ kind: "end" });
  return tokens;
}
