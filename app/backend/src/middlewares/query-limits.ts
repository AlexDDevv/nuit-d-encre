import {
    ASTVisitor,
    FragmentDefinitionNode,
    GraphQLError,
    Kind,
    SelectionSetNode,
    ValidationContext,
} from "graphql";

export interface QueryLimits {
    /** Niveaux de champs imbriqués au maximum (`books { author { id } }` = 3). */
    maxDepth: number;
    /** Champs au maximum par opération, fragments et alias compris. */
    maxFields: number;
}

/** Limites appliquées par le serveur : la requête la plus profonde du front en a 5. */
export const QUERY_LIMITS: QueryLimits = { maxDepth: 8, maxFields: 400 };

type Measure = { depth: number; fields: number };

/**
 * Règle de validation GraphQL : refuse une opération trop profonde
 * (`author { books { author { books … } } }`) ou trop large (centaines
 * d'alias d'une query coûteuse) avant toute exécution de resolver.
 *
 * Les fragments sont mesurés une seule fois (profondeur relative) : un
 * fragment répété ou imbriqué en cascade ne fait pas exploser le calcul.
 * Les champs d'introspection (`__schema`, `__type`…) ne sont pas comptés.
 */
export function queryLimitsRule({ maxDepth, maxFields }: QueryLimits) {
    return (context: ValidationContext): ASTVisitor => {
        const fragments = new Map<string, FragmentDefinitionNode>();
        for (const definition of context.getDocument().definitions) {
            if (definition.kind === Kind.FRAGMENT_DEFINITION) {
                fragments.set(definition.name.value, definition);
            }
        }
        const memo = new Map<string, Measure>();

        // Profondeur relative (0 = ensemble vide) et nombre de champs.
        const measure = (
            set: SelectionSetNode,
            visiting: Set<string>,
        ): Measure => {
            let depth = 0;
            let fields = 0;
            for (const selection of set.selections) {
                if (selection.kind === Kind.FIELD) {
                    if (selection.name.value.startsWith("__")) continue;
                    const child = selection.selectionSet
                        ? measure(selection.selectionSet, visiting)
                        : { depth: 0, fields: 0 };
                    depth = Math.max(depth, child.depth + 1);
                    fields += child.fields + 1;
                } else if (selection.kind === Kind.INLINE_FRAGMENT) {
                    const child = measure(selection.selectionSet, visiting);
                    depth = Math.max(depth, child.depth);
                    fields += child.fields;
                } else {
                    const name = selection.name.value;
                    const fragment = fragments.get(name);
                    // Fragment inconnu ou cyclique : signalé par les règles
                    // standard de graphql-js.
                    if (!fragment || visiting.has(name)) continue;
                    let child = memo.get(name);
                    if (!child) {
                        visiting.add(name);
                        child = measure(fragment.selectionSet, visiting);
                        visiting.delete(name);
                        memo.set(name, child);
                    }
                    depth = Math.max(depth, child.depth);
                    fields += child.fields;
                }
            }
            return { depth, fields };
        };

        return {
            OperationDefinition(node) {
                const { depth, fields } = measure(node.selectionSet, new Set());
                if (depth > maxDepth) {
                    context.reportError(
                        new GraphQLError(
                            `Requête trop profonde : ${depth} niveaux (maximum ${maxDepth}).`,
                            { nodes: [node] },
                        ),
                    );
                }
                if (fields > maxFields) {
                    context.reportError(
                        new GraphQLError(
                            `Requête trop large : ${fields} champs (maximum ${maxFields}).`,
                            { nodes: [node] },
                        ),
                    );
                }
            },
        };
    };
}
