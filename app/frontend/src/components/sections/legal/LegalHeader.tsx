import MoonMedallion from "@/components/sections/shared/MoonMedallion";
import Ornament from "@/components/sections/shared/Ornament";
import { MonoEyebrow } from "@/components/sections/shared/ornaments";

export default function LegalHeader({ lastUpdate }: { lastUpdate: string }) {
    return (
        <header className="grain bg-card/60 border-border relative overflow-hidden rounded-2xl border-2 px-6 py-12 text-center md:px-12 md:py-16">
            {/* vignette de chandelle locale */}
            <div
                aria-hidden="true"
                className="hero-halo pointer-events-none absolute inset-0"
            />
            <div className="relative flex flex-col items-center">
                <MoonMedallion size={66} ring />
                <MonoEyebrow className="mt-5">Document officiel</MonoEyebrow>

                <div className="mt-5 flex flex-col items-center">
                    <Ornament width="w-12" />
                    <h1 className="text-gradient-gold font-title mt-3 text-4xl font-black leading-[1.04] tracking-tight md:text-6xl">
                        Mentions légales
                    </h1>
                    <Ornament className="mt-3" width="w-12" />
                </div>

                <p className="text-muted-foreground font-quote mt-5 max-w-md text-lg italic leading-relaxed">
                    Informations juridiques et politique de confidentialité du
                    site Nuit d'Encre - sa veillée, sa bibliothèque et ses
                    lecteurs.
                </p>

                <p className="text-muted-foreground/70 tracking-caps mt-6 font-mono text-xs uppercase">
                    Dernière mise à jour :{" "}
                    <span className="text-primary/75">{lastUpdate}</span>
                </p>
            </div>
        </header>
    );
}
