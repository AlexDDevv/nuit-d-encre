import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import {
    LuCheck,
    LuCopy,
    LuMinus,
    LuPlus,
    LuGripHorizontal,
} from "react-icons/lu";
import { cn } from "@/lib/utils";
import type {
    FloatingPosition,
    TechLineProps,
    TechNoticeProps,
} from "@/types/types";

const EDGE = 8;

function clampToViewport(
    pos: FloatingPosition,
    el: HTMLElement,
): FloatingPosition {
    const { width, height } = el.getBoundingClientRect();
    return {
        x: Math.min(
            Math.max(pos.x, EDGE),
            Math.max(EDGE, window.innerWidth - width - EDGE),
        ),
        y: Math.min(
            Math.max(pos.y, EDGE),
            Math.max(EDGE, window.innerHeight - height - EDGE),
        ),
    };
}

function TechLine({ label, tone, children }: TechLineProps) {
    return (
        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
            <dt className="text-primary/45">{label}</dt>
            <dd
                className={cn(
                    "wrap-break-word min-w-0",
                    tone === "destructive" &&
                        "font-semibold text-[hsl(3_84%_64%)]",
                    tone === "accent" && "text-primary/85",
                    !tone && "text-foreground/90",
                )}
            >
                {children}
            </dd>
        </div>
    );
}

/**
 * Détails techniques en fenêtre de terminal flottante, déplaçable par sa
 * barre de titre et réductible. Seul endroit où le monospace et le rouge
 * destructif apparaissent. Réservé au mode développement (le parent garde
 * l'affichage par `import.meta.env.DEV`).
 */
export default function TechNotice({ tech }: TechNoticeProps) {
    const windowRef = useRef<HTMLDivElement>(null);
    const dragOrigin = useRef<{
        pointer: FloatingPosition;
        window: FloatingPosition;
    } | null>(null);
    const [position, setPosition] = useState<FloatingPosition | null>(null);
    const [open, setOpen] = useState(true);
    const [dragging, setDragging] = useState(false);
    const [copied, setCopied] = useState(false);

    // Garde la fenêtre visible quand le viewport ou sa taille change.
    const reclamp = useCallback(() => {
        const el = windowRef.current;
        if (!el) return;
        setPosition((p) => (p ? clampToViewport(p, el) : p));
    }, []);

    useEffect(() => {
        window.addEventListener("resize", reclamp);
        return () => window.removeEventListener("resize", reclamp);
    }, [reclamp]);

    useEffect(reclamp, [open, reclamp]);

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest("button"))
            return;
        const el = windowRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        dragOrigin.current = {
            pointer: { x: e.clientX, y: e.clientY },
            window: { x: rect.left, y: rect.top },
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const origin = dragOrigin.current;
        const el = windowRef.current;
        if (!origin || !el) return;
        setPosition(
            clampToViewport(
                {
                    x: origin.window.x + e.clientX - origin.pointer.x,
                    y: origin.window.y + e.clientY - origin.pointer.y,
                },
                el,
            ),
        );
    };

    const endDrag = () => {
        dragOrigin.current = null;
        setDragging(false);
    };

    const copy = async () => {
        const text = [
            `type: ${tech.type}`,
            tech.status && `status: ${tech.status}`,
            tech.message && `message: ${tech.message}`,
            tech.data && `data: ${tech.data}`,
            tech.stack && `\n${tech.stack}`,
        ]
            .filter(Boolean)
            .join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Presse-papiers indisponible (contexte non sécurisé) : sans effet.
        }
    };

    return (
        <div
            ref={windowRef}
            role="region"
            aria-label="Détails techniques (développement)"
            style={position ? { left: position.x, top: position.y } : undefined}
            className={cn(
                "fixed z-50 w-[min(30rem,calc(100vw-1rem))] overflow-hidden rounded-lg text-left",
                "border-border bg-background/92 border font-mono text-xs backdrop-blur-md",
                "shadow-[0_24px_60px_-12px_hsl(0_0%_0%/0.7),0_0_0_1px_hsl(43_59%_81%/0.04),inset_0_1px_0_hsl(43_59%_81%/0.06)]",
                !position && "bottom-4 right-2 sm:right-4",
                dragging ? "select-none" : "transition-shadow",
            )}
        >
            <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(
                    "bg-popover border-border/70 flex touch-none items-center gap-3 px-3 py-2",
                    open && "border-b",
                    dragging ? "cursor-grabbing" : "cursor-grab",
                )}
            >
                <span aria-hidden className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-[hsl(3_70%_58%)]" />
                    <span className="bg-warning/85 size-2.5 rounded-full" />
                    <span className="size-2.5 rounded-full bg-[hsl(95_35%_52%)]" />
                </span>
                <span className="text-muted-foreground flex min-w-0 flex-1 items-center justify-center gap-2 truncate">
                    <LuGripHorizontal
                        aria-hidden
                        className="text-primary/35 shrink-0"
                    />
                    <span className="truncate">~/nuit-d-encre — erreur</span>
                    <span className="border-warning/40 bg-warning/10 text-warning text-xxxs rounded border px-1.5 py-px font-semibold uppercase tracking-[0.18em]">
                        dev
                    </span>
                </span>
                <span className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={copy}
                        aria-label="Copier les détails techniques"
                        className="text-primary/60 hover:text-primary hover:bg-primary/10 focus-visible:ring-primary/70 rounded p-1 transition-colors focus:outline-none focus-visible:ring-2"
                    >
                        {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-label={
                            open
                                ? "Réduire les détails techniques"
                                : "Afficher les détails techniques"
                        }
                        className="text-primary/60 hover:text-primary hover:bg-primary/10 focus-visible:ring-primary/70 rounded p-1 transition-colors focus:outline-none focus-visible:ring-2"
                    >
                        {open ? <LuMinus size={14} /> : <LuPlus size={14} />}
                    </button>
                </span>
            </div>

            {open && (
                <div className="max-h-[min(60vh,32rem)] overflow-auto px-4 py-3 leading-relaxed">
                    <p className="text-muted-foreground/70 mb-2.5">
                        <span className="text-primary">❯</span> inspect
                        --last-error
                    </p>
                    <dl className="space-y-1">
                        <TechLine label="type" tone="destructive">
                            ✖ {tech.type}
                        </TechLine>
                        {tech.status && (
                            <TechLine label="status">{tech.status}</TechLine>
                        )}
                        {tech.message && (
                            <TechLine label="message">{tech.message}</TechLine>
                        )}
                        {tech.data && (
                            <TechLine label="data" tone="accent">
                                {tech.data}
                            </TechLine>
                        )}
                    </dl>
                    {tech.stack && (
                        <>
                            <p className="text-primary/45 mb-1.5 mt-4">
                                ── stack trace
                            </p>
                            <pre className="text-muted-foreground/85 text-xxs whitespace-pre leading-relaxed">
                                {tech.stack}
                            </pre>
                        </>
                    )}
                    <p className="text-muted-foreground/70 mt-3">
                        <span className="text-primary">❯</span>{" "}
                        <span
                            aria-hidden
                            className="caret-blink bg-primary/80 inline-block h-3.5 w-[0.5em] translate-y-0.5"
                        />
                    </p>
                </div>
            )}
        </div>
    );
}
