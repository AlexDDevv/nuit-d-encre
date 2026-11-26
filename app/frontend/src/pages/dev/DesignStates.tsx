import { useState } from "react";
import { LuGlobe, LuHash, LuMail } from "react-icons/lu";
import Banner from "@/components/UI/Banner/Banner";
import XpPill from "@/components/UI/Banner/XpPill";
import Button from "@/components/UI/Button/Button";
import IncompleteChip from "@/components/UI/IncompleteChip";
import { Input } from "@/components/UI/form/Input";
import { Textarea } from "@/components/UI/form/Textarea";
import FieldShell, {
    CharCounter,
} from "@/components/sections/shared/FieldShell";
import PasswordStrengthMeter from "@/components/sections/auth/PasswordStrengthMeter";
import { ConfirmDialog } from "@/components/sections/admin/ui/ConfirmDialog";
import { StatusChip } from "@/components/sections/admin/ui/chips";
import { Missing } from "@/components/sections/shared/Notice";
import { BOOK_STATES, STATUS_COLORS } from "@/constants/bookStatus";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import type { DesignSectionProps } from "@/types/types";

/**
 * Page de contrôle visuel des tokens d'état (dev uniquement, /dev/etats).
 * Temporaire : à supprimer une fois le rendu validé.
 */

const STATES = ["info", "success", "warning", "error", "reward"] as const;
const ROLES = ["", "-foreground", "-border", "-surface", "-subtle"] as const;
const PASSWORDS = ["abc", "abcdefgh", "Abcdefgh", "Abcdefg1", "Abcdef1!"];

function Section({ title, children }: DesignSectionProps) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-gold-muted tracking-caps font-mono text-xs uppercase">
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function DesignStates() {
    const { showToast } = useToast();
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-14">
            <header>
                <h1 className="font-title text-foreground text-3xl font-bold">
                    États et tokens
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Page de contrôle temporaire (dev uniquement).
                </p>
            </header>

            <Section title="Bannières">
                <Banner variant="info" title="Information">
                    Texte secondaire d'une bannière d'information.
                </Banner>
                <Banner
                    variant="success"
                    title="Livre ajouté à la bibliothèque"
                    action={{
                        label: "Voir",
                        onClick: () => undefined,
                        ariaLabel: "Voir",
                    }}
                >
                    Avec un bouton d'action.
                </Banner>
                <Banner variant="warning" title="Fiche incomplète" dismissible>
                    Bannière refermable.
                </Banner>
                <Banner variant="error" title="Impossible d'enregistrer">
                    Rôle alert : annoncée immédiatement par les lecteurs
                    d'écran.
                </Banner>
                <Banner
                    variant="completion"
                    title="Complétez la fiche"
                    action={{
                        label: "Compléter",
                        onClick: () => undefined,
                        ariaLabel: "Compléter",
                        xp: 50,
                    }}
                >
                    Récompense dorée <XpPill amount={50} /> avec balayage.
                </Banner>
            </Section>

            <Section title="Toasts">
                <div className="flex flex-wrap gap-3">
                    {(["success", "error", "warning", "info"] as const).map(
                        (type) => (
                            <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    showToast({ type, title: `Toast ${type}` })
                                }
                            >
                                {type}
                            </Button>
                        ),
                    )}
                    {(["success", "error", "warning", "info"] as const).map(
                        (type) => (
                            <Button
                                key={`${type}-full`}
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    showToast({
                                        type,
                                        title: `Toast ${type}`,
                                        description:
                                            "Avec une description et une action.",
                                        actionLabel: "Ouvrir",
                                        redirectTo: "/dev/etats",
                                    })
                                }
                            >
                                {type} + action
                            </Button>
                        ),
                    )}
                </div>
            </Section>

            <Section title="Champs : neutre, erreur, succès">
                <div className="grid gap-6 md:grid-cols-3">
                    <FieldShell
                        htmlFor="dev-default"
                        label="Neutre"
                        icon={LuMail}
                        hint="Indice affiché sous le champ"
                    >
                        <Input
                            id="dev-default"
                            className="pl-11"
                            placeholder="lecteur@exemple.fr"
                        />
                    </FieldShell>
                    <FieldShell
                        htmlFor="dev-error"
                        label="Erreur"
                        icon={LuMail}
                        required
                        error="Adresse e-mail invalide"
                    >
                        <Input
                            id="dev-error"
                            state="error"
                            className="pl-11"
                            defaultValue="lecteur@"
                        />
                    </FieldShell>
                    <FieldShell
                        htmlFor="dev-success"
                        label="Succès avec message"
                        icon={LuHash}
                        success="Clé de contrôle vérifiée"
                    >
                        <Input
                            id="dev-success"
                            state="success"
                            className="pl-11 font-mono"
                            defaultValue="9782070368228"
                        />
                    </FieldShell>
                    <FieldShell
                        htmlFor="dev-success-border"
                        label="Succès sans message (URL, champ corrigé)"
                        icon={LuGlobe}
                    >
                        <Input
                            id="dev-success-border"
                            state="success"
                            className="pl-11"
                            defaultValue="https://fr.wikipedia.org/wiki/Colette"
                        />
                    </FieldShell>
                    <FieldShell
                        htmlFor="dev-textarea-error"
                        label="Zone de texte en erreur"
                        error="La critique doit faire au moins 10 caractères"
                        counter={{ value: 4, max: 2000 }}
                    >
                        <Textarea
                            id="dev-textarea-error"
                            state="error"
                            rows={3}
                            className="font-quote min-h-24 text-base"
                            defaultValue="Bof"
                        />
                    </FieldShell>
                    <FieldShell
                        htmlFor="dev-disabled"
                        label="Désactivé"
                        counter={{ value: 285, max: 300 }}
                    >
                        <Input
                            id="dev-disabled"
                            disabled
                            defaultValue="Lecture seule"
                        />
                    </FieldShell>
                </div>
                <div className="flex items-center gap-6">
                    <CharCounter value={120} max={300} />
                    <CharCounter value={285} max={300} />
                    <CharCounter value={312} max={300} />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {PASSWORDS.map((p) => (
                        <div key={p}>
                            <p className="text-subtle-foreground mb-1 font-mono text-xs">
                                {p}
                            </p>
                            <PasswordStrengthMeter value={p} />
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Pastilles et badges">
                <div className="flex flex-wrap items-center gap-3">
                    {BOOK_STATES.map(({ value, label, icon: StatusIcon }) => (
                        <span
                            key={value}
                            className={cn(
                                "font-body text-xxs inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-bold",
                                STATUS_COLORS[value].chip,
                            )}
                        >
                            <StatusIcon className="h-2.5 w-2.5" />
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {BOOK_STATES.map(({ value, label }) => (
                        <span
                            key={value}
                            className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"
                        >
                            <span
                                className={cn(
                                    "h-2 w-2 rounded-full",
                                    STATUS_COLORS[value].dot,
                                )}
                            />
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <IncompleteChip />
                    <StatusChip />
                    <StatusChip signaled />
                    <Missing />
                    <XpPill amount={100} />
                </div>
            </Section>

            <Section title="Boutons et dialogue">
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primaire</Button>
                    <Button variant="secondary">Secondaire</Button>
                    <Button variant="outline">Contour</Button>
                    <Button variant="destructive">Supprimer</Button>
                    <Button variant="destructiveGhost">Retirer</Button>
                    <Button
                        variant="destructiveGhost"
                        onClick={() => setConfirmOpen(true)}
                    >
                        Ouvrir la confirmation
                    </Button>
                </div>
                <ConfirmDialog
                    open={confirmOpen}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={() => setConfirmOpen(false)}
                    title="Supprimer ce livre ?"
                    warning="Les critiques associées seront aussi supprimées."
                >
                    Cette action est définitive.
                </ConfirmDialog>
            </Section>

            <Section title="Nuancier des états">
                <div className="grid gap-4">
                    {STATES.map((state) => (
                        <div
                            key={state}
                            className="border-border bg-card grid grid-cols-[6rem_repeat(5,1fr)] items-center gap-3 rounded-xl border-2 p-4"
                        >
                            <span
                                className="font-mono text-sm font-bold"
                                style={{ color: `var(--color-${state})` }}
                            >
                                {state}
                            </span>
                            {ROLES.map((role) => (
                                <div
                                    key={role}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <span
                                        className="border-border h-10 w-full rounded-md border"
                                        style={{
                                            background: `linear-gradient(var(--color-${state}${role}), var(--color-${state}${role})), var(--color-card)`,
                                        }}
                                    />
                                    <span className="text-subtle-foreground text-xxs font-mono">
                                        {role || "base"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
