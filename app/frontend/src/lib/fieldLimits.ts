/** Valeur d'une règle react-hook-form (`maxLength: 100` ou `{ value: 100, message }`). */
export function ruleValue(rule: unknown): number | undefined {
    if (typeof rule === "number") return rule;
    if (rule && typeof rule === "object" && "value" in rule) {
        const { value } = rule as { value: unknown };
        return typeof value === "number" ? value : undefined;
    }
    return undefined;
}
