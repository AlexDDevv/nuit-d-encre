import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FieldError, FieldValues } from "react-hook-form";
import { Input } from "@/components/UI/form/Input";
import FieldShell from "@/components/sections/shared/FieldShell";
import { useRecovered } from "@/hooks/form/useRecovered";
import { ruleValue } from "@/lib/fieldLimits";
import { cn } from "@/lib/utils";
import { TextFieldProps } from "@/types/types";

/** Champ texte de l'atelier : habillage `FieldShell` + `Input` conservé. */
export default function TextField<T extends FieldValues>({
    name,
    label,
    register,
    errors,
    rules,
    icon,
    required,
    hint,
    mono,
    success,
    preventDecimal,
    type = "text",
    ...inputProps
}: TextFieldProps<T>) {
    const error = (errors as Record<string, FieldError | undefined>)[name]
        ?.message;
    const { onChange, ...field } = register(name, rules);
    const [filled, setFilled] = useState(false);
    // Mot de passe : l'œil bascule l'affichage en clair, le temps de relire.
    const isPassword = type === "password";
    const [revealed, setRevealed] = useState(false);
    const recovered = useRecovered(error, filled);
    const succeeded = !error && (!!success || recovered);
    // La borne de validation sert aussi de limite de saisie : on ne peut pas
    // taper au-delà. Un champ numérique est plafonné au nombre de chiffres de
    // son maximum (maxLength est ignoré par les <input type="number">).
    const maxLength = ruleValue(rules?.maxLength);
    const max = ruleValue(rules?.max);
    const maxDigits =
        type === "number" && max !== undefined
            ? String(Math.trunc(max)).length
            : undefined;

    return (
        <FieldShell
            htmlFor={name}
            label={label}
            icon={icon}
            required={required}
            error={error}
            success={
                !error && typeof success === "string" ? success : undefined
            }
            hint={hint}
        >
            <Input
                id={name}
                type={isPassword && revealed ? "text" : type}
                state={error ? "error" : succeeded ? "success" : "default"}
                className={cn(
                    icon && "pl-11",
                    isPassword && "pr-11",
                    mono && "font-mono",
                )}
                aria-required={required}
                onKeyDown={
                    preventDecimal
                        ? (e) => {
                              if (e.key === "." || e.key === ",") {
                                  e.preventDefault();
                              }
                          }
                        : undefined
                }
                maxLength={maxLength}
                {...inputProps}
                {...field}
                onChange={(e) => {
                    if (maxDigits && e.target.value.length > maxDigits) {
                        e.target.value = e.target.value.slice(0, maxDigits);
                    }
                    setFilled(e.target.value !== "");
                    return onChange(e);
                }}
                aria-invalid={error ? "true" : "false"}
                errorMessage={error}
                hideErrorMessage
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setRevealed((v) => !v)}
                    aria-label={
                        revealed
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                    }
                    aria-pressed={revealed}
                    aria-controls={name}
                    className="text-primary/45 hover:text-primary focus-visible:ring-primary/70 absolute right-2 top-[22px] z-10 grid size-8 -translate-y-1/2 place-items-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
                >
                    {revealed ? <LuEyeOff size={17} /> : <LuEye size={17} />}
                </button>
            )}
        </FieldShell>
    );
}
