import type { ProfileFieldProps } from "@/types/types";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";

// - Champ : étiquette ornementale + indice + erreur inline -
export default function Field({
    id,
    label,
    hint,
    error,
    success,
    children,
}: ProfileFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="flex items-baseline justify-between gap-3"
            >
                <span className="text-foreground/85 font-quote text-base italic">
                    {label}
                </span>
                {hint && (
                    <span className="text-muted-foreground/70 font-body text-xs uppercase tracking-wider">
                        {hint}
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p
                    role="alert"
                    className="text-error font-body flex items-center gap-1.5 text-xs font-bold"
                >
                    <FaCircleExclamation size={13} /> {error}
                </p>
            )}
            {!error && success && (
                <p
                    role="status"
                    className="text-success font-body flex items-center gap-1.5 text-xs font-bold"
                >
                    <FaCircleCheck size={13} /> {success}
                </p>
            )}
        </div>
    );
}
