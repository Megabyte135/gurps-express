import type { Computable, EntityId } from "../../common.js";
import type { ComputedValue } from "../../values/computed-value.js";
import type { Condition } from "../conditions/condition.js";
import type { Trait } from "../traits/trait.js";
import type { Effect } from "./effect.js";
export type StateWithEffects = Trait | Condition;
export interface ComputedValueResolver {
    get(target: Computable): ComputedValue | null;
}
export declare function applyStateEffects(state: StateWithEffects, resolver: ComputedValueResolver): readonly EntityId[];
export declare function removeStateEffects(state: StateWithEffects, resolver: ComputedValueResolver): readonly EntityId[];
export declare function applyEffectToState(state: StateWithEffects, effect: Effect, resolver: ComputedValueResolver): readonly EntityId[];
export declare function removeEffectFromState(state: StateWithEffects, effect: Effect, resolver: ComputedValueResolver): readonly EntityId[];
//# sourceMappingURL=state-effect-processor.d.ts.map