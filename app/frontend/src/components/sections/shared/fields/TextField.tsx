import { useState } from "react";
import { FieldError, FieldValues } from "react-hook-form";
import { Input } from "@/components/UI/form/Input";
import FieldShell from "@/components/sections/shared/FieldShell";
import { useRecovered } from "@/hooks/form/useRecovered";
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
    const recovered = useRecovered(error, filled);
    const succeeded = !error && (!!success || recovered);

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
                type={type}
                state={error ? "error" : succeeded ? "success" : "default"}
                className={cn(icon && "pl-11", mono && "font-mono")}
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
                {...inputProps}
                {...field}
                onChange={(e) => {
                    setFilled(e.target.value !== "");
                    return onChange(e);
                }}
                aria-invalid={error ? "true" : "false"}
                errorMessage={error}
                hideErrorMessage
            />
        </FieldShell>
    );
}
