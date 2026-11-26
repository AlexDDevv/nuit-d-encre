import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import ErrorInput from "@/components/UI/form/ErrorInput";
import { fieldVariants } from "@/components/UI/form/field.styles";
import type { InputProps } from "@/types/types";

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            state,
            errorMessage,
            hideErrorMessage = false,
            ...props
        },
        ref,
    ) => {
        return (
            <div className="flex w-full flex-col gap-1">
                <input
                    type={type}
                    className={cn(
                        fieldVariants({
                            kind: "input",
                            state:
                                state ?? (errorMessage ? "error" : "default"),
                        }),
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {!hideErrorMessage && errorMessage && (
                    <ErrorInput message={errorMessage} />
                )}
            </div>
        );
    },
);
Input.displayName = "Input";

export { Input };
