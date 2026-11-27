import EditorialPanel from "@/components/sections/auth/EditorialPanel";
import SignatureFooter from "@/components/sections/shared/SignatureFooter";
import { AuthShellProps } from "@/types/types";

/**
 * Coquille partagée des écrans d'authentification : panneau éditorial + carte
 * scellée (avec halo de chandelle) + pied de signature. Le contenu du
 * formulaire est fourni en `children`.
 */
export default function AuthShell({
    mode,
    onSubmit,
    children,
}: AuthShellProps) {
    return (
        <div className="animate-fadeIn max-w-250 mx-auto flex w-full flex-1 flex-col justify-center">
            {/* Seuil : panneau éditorial + carte d'accès */}
            <div className="grid lg:grid-cols-[1fr_minmax(420px,468px)]">
                <EditorialPanel mode={mode} />

                <div className="border-border bg-card shadow-panel inset-shadow-highlight relative overflow-hidden rounded-3xl border-2 lg:rounded-l-none lg:rounded-r-2xl">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(420px 200px at 50% -6%, hsl(43 45% 55% / 0.16), transparent 65%)",
                        }}
                    />
                    <form
                        onSubmit={onSubmit}
                        noValidate
                        className="relative flex flex-col px-7 py-8 sm:px-9 sm:py-9"
                    >
                        {children}
                    </form>
                </div>
            </div>

            <SignatureFooter />
        </div>
    );
}
