import { RegisterOptions } from "react-hook-form";

/** Règles du champ email des écrans d'authentification (borne : 254, comme le back). */
export const EMAIL_RULES = {
    required: "L'email est requis",
    pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Format d'email invalide",
    },
    maxLength: {
        value: 254,
        message: "Adresse trop longue (254 caractères maximum).",
    },
} satisfies RegisterOptions;
