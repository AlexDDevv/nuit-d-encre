import { FieldError, FieldValues } from "react-hook-form";
import { Textarea } from "@/components/UI/form/Textarea";
import FieldShell from "@/components/sections/shared/FieldShell";
import { useRecovered } from "@/hooks/form/useRecovered";
import { TextareaFieldProps } from "@/types/types";

/** Zone de texte serif de l'atelier : `FieldShell` + `Textarea` conservé. */
export default function TextareaField<T extends FieldValues>({
    name,
    label,
    register,
    errors,
    rules,
    required,
    placeholder,
    rows = 5,
    max,
    length,
    textareaRef,
}: TextareaFieldProps<T>) {
    const error = (errors as Record<string, FieldError | undefined>)[name]
        ?.message;
    const { ref, ...field } = register(name, rules);
    const recovered = useRecovered(error, length > 0);

    return (
        <FieldShell
            htmlFor={name}
            label={label}
            required={required}
            error={error}
            counter={{ value: length, max }}
        >
            <Textarea
                id={name}
                rows={rows}
                state={error ? "error" : recovered ? "success" : "default"}
                className="font-quote text-base"
                placeholder={placeholder}
                aria-required={required}
                {...field}
                ref={(element) => {
                    ref(element);
                    if (textareaRef) textareaRef.current = element;
                }}
                aria-invalid={error ? "true" : "false"}
                errorMessage={error}
                hideErrorMessage
            />
        </FieldShell>
    );
}
