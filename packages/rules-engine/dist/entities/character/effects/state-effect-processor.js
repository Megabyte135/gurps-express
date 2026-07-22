export function applyStateEffects(state, resolver) {
    return state.effects.flatMap((effect) => applyEffectToState(state, effect, resolver));
}
export function removeStateEffects(state, resolver) {
    return state.effects.flatMap((effect) => removeEffectFromState(state, effect, resolver));
}
export function applyEffectToState(state, effect, resolver) {
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
export function removeEffectFromState(state, effect, resolver) {
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
//# sourceMappingURL=state-effect-processor.js.map