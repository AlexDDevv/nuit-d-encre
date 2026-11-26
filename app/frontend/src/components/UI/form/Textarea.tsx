import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import ErrorInput from "@/components/UI/form/ErrorInput";
import { fieldVariants } from "@/components/UI/form/field.styles";
import type { TextareaProps } from "@/types/types";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            state,
            errorMessage,
            counter = false,
            maxLength,
            hideErrorMessage = false,
            onChange,
            value,
            defaultValue,
            ...props
        },
        ref,
    ) => {
        const [charCount, setCharCount] = useState(
            ((value ?? defaultValue) as string | undefined)?.length ?? 0,
        );

        const currentLength =
            typeof value === "string" ? value.length : charCount;

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            onChange?.(e);
        };

        return (
            <div className="flex flex-col gap-1">
                <textarea
                    className={cn(
                        fieldVariants({
                            kind: "textarea",
                            state:
                                state ?? (errorMessage ? "error" : "default"),
                        }),
                        className,
                    )}
                    value={value}
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    ref={ref}
                    {...props}
                />
                {((!hideErrorMessage && errorMessage) ||
                    (counter && maxLength)) && (
                    <div className="flex items-center justify-between gap-5">
                        {!hideErrorMessage && errorMessage && (
                            <ErrorInput message={errorMessage} />
                        )}
                        {counter && maxLength && (
                            <p className="text-card-foreground ml-auto text-xs">
                                {currentLength}/{maxLength}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
