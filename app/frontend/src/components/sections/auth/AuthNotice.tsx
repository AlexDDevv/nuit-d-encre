import {
    LuCircleAlert,
    LuCircleCheck,
    LuInfo,
    LuMailCheck,
} from "react-icons/lu";
import { cn } from "@/lib/utils";
import { AuthNoticeProps } from "@/types/types";

const STYLES = {
    info: {
        box: "border-info-border bg-info-surface",
        icon: "text-info",
        Icon: LuMailCheck,
    },
    success: {
        box: "border-success-border bg-success-surface",
        icon: "text-success",
        Icon: LuCircleCheck,
    },
    warning: {
        box: "border-warning-border bg-warning-surface",
        icon: "text-warning",
        Icon: LuInfo,
    },
    error: {
        box: "border-error-border bg-error-surface",
        icon: "text-error",
        Icon: LuCircleAlert,
    },
} as const;

/** Encadré d'état des écrans d'authentification, porté par les tokens d'état. */
export default function AuthNotice({
    state,
    title,
    children,
}: AuthNoticeProps) {
    const { box, icon, Icon } = STYLES[state];

    return (
        <div
            role={state === "error" || state === "warning" ? "alert" : "status"}
            className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3.5",
                box,
            )}
        >
            <Icon
                size={18}
                aria-hidden="true"
                className={cn("mt-0.5 shrink-0", icon)}
            />
            <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-foreground text-sm font-semibold">{title}</p>
                {children && (
                    <div className="text-muted-foreground text-sm leading-relaxed">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
