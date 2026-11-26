import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Input } from "@/components/UI/form/Input";
import type { ProfileInputProps } from "@/types/types";

export function TextInput({ id, error, success, ...rest }: ProfileInputProps) {
    return (
        <Input
            id={id}
            aria-invalid={!!error}
            errorMessage=""
            hideErrorMessage
            state={error ? "error" : success ? "success" : "default"}
            {...rest}
        />
    );
}

export function PasswordInput({
    id,
    error,
    success,
    ...rest
}: ProfileInputProps) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                aria-invalid={!!error}
                errorMessage=""
                hideErrorMessage
                state={error ? "error" : success ? "success" : "default"}
                className="pr-11"
                {...rest}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={
                    show
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                }
                title={show ? "Masquer" : "Afficher"}
                className="text-muted-foreground hover:text-primary absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md transition-colors focus:outline-none"
            >
                {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
        </div>
    );
}
