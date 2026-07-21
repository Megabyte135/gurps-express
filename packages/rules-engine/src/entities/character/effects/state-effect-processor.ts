import type { Computable, EntityId } from "../../common.js";
import type { ComputedValue } from "../../values/computed-value.js";
import type { Condition } from "../conditions/condition.js";
import type { Resource } from "../resources/resource.js";
import type { Skill } from "../skills/skill.js";
import type { Trait } from "../traits/trait.js";
import type { Effect } from "./effect.js";

export type StateWithEffects = Trait | Skill | Condition | Resource;

export interface ComputedValueResolver {
  get(target: Computable): ComputedValue | null;
}

export function applyStateEffects(state: StateWithEffects, resolver: ComputedValueResolver): readonly EntityId[] {
  return state.effects.flatMap((effect) =>
    applyEffectToState(state, effect, resolver));
}

export function removeStateEffects(state: StateWithEffects, resolver: ComputedValueResolver): readonly EntityId[] {
  return state.effects.flatMap((effect) =>
    removeEffectFromState(state, effect, resolver));
}

export function applyEffectToState(
  state: StateWithEffects,
  effect: Effect,
  resolver: ComputedValueResolver,
): readonly EntityId[] {
  return effect.targets.flatMap((target) => {
    const value = resolver.get(target);
    if (value === null) {
      throw new Error(`Computed value ${target.type}:${target.id} not found for effect ${effect.id}.`);
    }
    const changeId = `${state.type}:${state.id}:${effect.id}:${target.type}:${target.id}`;
    value.applyMutation({
      id: changeId,
      reason: effect.description,
      source: {
        kind: state.type,
        id: state.id,
        description: effect.source.description,
      },
      operand: effect.operand,
      magnitude: effect.magnitude,
    });
    return [changeId];
  });
}

export function removeEffectFromState(
  state: StateWithEffects,
  effect: Effect,
  resolver: ComputedValueResolver,
): readonly EntityId[] {
  return effect.targets.flatMap((target) => {
    const value = resolver.get(target);
    if (value === null) {
      return [];
    }
    const changeId = `${state.type}:${state.id}:${effect.id}:${target.type}:${target.id}`;
    const removed = value.removeMutation(changeId);
    return removed ? [changeId] : [];
  });
}
