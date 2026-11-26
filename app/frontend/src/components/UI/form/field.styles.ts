import { cva } from "class-variance-authority";

/**
 * Habillage unique des champs de saisie (« atelier du scribe ») : bordure 2px
 * qui s'illumine, fond popover, halo au focus. L'état teinte bordure et halo :
 * doré par défaut, rouge en erreur, vert en succès. Appliqué par défaut par
 * Input et Textarea ; à utiliser tel quel sur un <input>/<textarea> natif.
 */
export const fieldVariants = cva(
    "flex w-full rounded-lg border-2 bg-popover/70 px-3 py-2 text-sm text-foreground ring-offset-input transition-all duration-200 placeholder:not-italic placeholder:text-muted-foreground/45 placeholder:opacity-85 focus-visible:bg-popover focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            kind: {
                input: "h-10",
                textarea: "h-auto min-h-32 resize-y leading-relaxed",
                /** Édition inline (cellules de tableau) : compacte, sans hauteur fixe. */
                inline: "w-auto rounded-md px-2.5 py-1",
            },
            state: {
                default:
                    "border-border hover:border-primary/40 focus-visible:border-primary focus-visible:shadow-focus-halo",
                error: "border-error-border hover:border-error focus-visible:border-error focus-visible:shadow-focus-halo-error",
                success:
                    "border-success-border hover:border-success focus-visible:border-success focus-visible:shadow-focus-halo-success",
            },
        },
        defaultVariants: { kind: "input", state: "default" },
    },
);

/** Déclencheur de Select (Radix) aligné sur les champs ; l'erreur est posée par TypeSelect. */
export const selectTriggerClass =
    "h-10 rounded-lg border-2 border-border bg-popover/70 pr-3.5 text-sm text-foreground transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-0 focus:shadow-focus-halo data-placeholder:text-muted-foreground/45 data-[state=open]:border-primary data-[state=open]:shadow-focus-halo";
