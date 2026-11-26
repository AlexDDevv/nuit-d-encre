import { LuExternalLink, LuHistory, LuRotateCcw } from "react-icons/lu";
import Banner from "@/components/UI/Banner/Banner";
import { Ornament } from "@/components/sections/admin/ui/chips";
import { SavedBannerRow } from "@/components/sections/admin/ui/bannerEditor";
import type { BannerDraft, SavedBanner } from "@/types/types";

/** Panneau droit : aperçu en direct de la bannière + historique des bannières. */
export default function BannerPreviewPanel({
    draft,
    previewKey,
    previewDismissed,
    onReplay,
    onDismiss,
    saved,
    activeId,
    onReactivate,
    onLoad,
    onDelete,
}: {
    draft: BannerDraft;
    previewKey: number;
    previewDismissed: boolean;
    onReplay: () => void;
    onDismiss: () => void;
    saved: SavedBanner[];
    activeId: string | null;
    onReactivate: (item: SavedBanner) => void;
    onLoad: (item: SavedBanner) => void;
    onDelete: (item: SavedBanner) => void;
}) {
    const action =
        draft.hasAction && draft.actionLabel
            ? { label: draft.actionLabel, ariaLabel: draft.actionLabel }
            : undefined;

    return (
        <div className="order-1 flex flex-col gap-5 lg:sticky lg:top-24 lg:order-2">
            <div>
                <div className="mb-3 flex items-center gap-2.5">
                    <Ornament width="w-5" />
                    <span className="font-body text-muted-foreground tracking-spaced text-xs font-bold uppercase">
                        Aperçu en direct
                    </span>
                </div>
                <div className="border-border bg-background/60 rounded-2xl border-2 p-4 shadow-[inset_0_1px_0_hsl(43_30%_60%/0.05)]">
                    {previewDismissed ? (
                        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                            <p className="font-quote text-muted-foreground/70 text-base italic">
                                La bannière a été fermée par l'utilisateur.
                            </p>
                            <button
                                type="button"
                                onClick={onReplay}
                                className="border-border font-body text-muted-foreground hover:border-primary/55 hover:text-primary focus-visible:ring-primary/40 inline-flex items-center gap-1.5 rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2"
                            >
                                <LuRotateCcw size={13} /> Rejouer l'aperçu
                            </button>
                        </div>
                    ) : (
                        <Banner
                            key={previewKey}
                            variant={draft.variant}
                            title={draft.title || "Titre de la bannière…"}
                            action={action}
                            dismissible={draft.dismissible}
                            onDismiss={onDismiss}
                        >
                            {draft.content}
                        </Banner>
                    )}
                </div>
                {/* Récap redirection */}
                {draft.hasAction && draft.actionTarget && (
                    <div className="border-border bg-popover/40 font-body text-muted-foreground mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                        <LuExternalLink
                            size={13}
                            className="text-primary/65 shrink-0"
                        />
                        <span>Le bouton redirige vers&nbsp;</span>
                        <code className="bg-background/70 text-foreground/85 truncate rounded-sm px-1.5 py-0.5 font-mono text-xs">
                            {draft.actionTarget}
                        </code>
                    </div>
                )}
            </div>

            {/* Historique des bannières */}
            <div className="border-border bg-card rounded-xl border-2">
                <div className="border-border/70 flex items-center gap-2.5 border-b-2 px-4 py-3">
                    <LuHistory size={15} className="text-primary/75" />
                    <h3 className="font-body text-foreground/85 tracking-label text-xs font-bold uppercase">
                        Bannières enregistrées
                    </h3>
                    <span className="bg-muted/60 font-body text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-bold">
                        {saved.length}
                    </span>
                </div>
                <div className="max-h-115 flex flex-col gap-2.5 overflow-y-auto p-3">
                    {saved.map((item) => (
                        <SavedBannerRow
                            key={item.id}
                            item={item}
                            isActive={item.id === activeId}
                            onReactivate={() => onReactivate(item)}
                            onLoad={() => onLoad(item)}
                            onDelete={() => onDelete(item)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
