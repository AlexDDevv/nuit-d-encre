import type React from "react";
import { ComponentProps, RefObject } from "react";
import { IconType } from "react-icons";
import {
    Control,
    FieldErrors,
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
} from "react-hook-form";
import { TypeSelectOptions } from "./ui";

export type TextFieldProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    rules?: RegisterOptions<T, Path<T>>;
    icon?: IconType;
    required?: boolean;
    hint?: string;
    mono?: boolean;
    /** Succès : true pour la seule bordure, une chaîne pour un message en plus. */
    success?: boolean | string;
    /** Empêche la saisie de « . » et « , » (champs entiers). */
    preventDecimal?: boolean;
} & Pick<
    ComponentProps<"input">,
    "type" | "placeholder" | "inputMode" | "step" | "autoComplete"
>;

export type TextareaFieldProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    rules?: RegisterOptions<T, Path<T>>;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    max: number;
    /** Longueur courante (via `watch`) pour alimenter le compteur. */
    length: number;
    /** Accès à l'élément, par exemple pour agir sur la sélection. */
    textareaRef?: RefObject<HTMLTextAreaElement | null>;
};

export type SelectFieldProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    control: Control<T>;
    errors: FieldErrors<T>;
    options: TypeSelectOptions[];
    message: string;
    placeholder: string;
    icon?: IconType;
    required?: boolean;
    disabled?: boolean;
};

/** État visuel d'un champ : teinte la bordure et le halo de focus. */
export type FieldState = "default" | "error" | "success";

export type InputProps = ComponentProps<"input"> & {
    /** Par défaut : "error" si errorMessage est renseigné, sinon "default". */
    state?: FieldState;
    errorMessage?: string;
    /** Masque le message d'erreur intégré (la bordure d'erreur reste appliquée). */
    hideErrorMessage?: boolean;
};

export type TextareaProps = ComponentProps<"textarea"> & {
    state?: FieldState;
    errorMessage?: string;
    counter?: boolean;
    maxLength?: number;
    hideErrorMessage?: boolean;
};

/** Champ de la modale de profil : l'erreur et le succès pilotent l'état. */
export type ProfileInputProps = {
    id: string;
    error?: string;
    success?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export type ProfileFieldProps = {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    /** Message de succès, affiché seulement sans erreur. */
    success?: string;
    children: React.ReactNode;
};
