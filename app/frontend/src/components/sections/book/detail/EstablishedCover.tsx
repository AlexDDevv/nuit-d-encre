import { FaFeatherPointed } from "react-icons/fa6";
import { Book } from "@/types/types";
import FallbackCover from "../FallbackCover";

type AuthorIdentity = {
    id: string;
    firstname: string;
    lastname: string;
    createdAt?: string;
};

type EstablishedCoverProps =
    | { variant?: "book"; book: Book }
    | { variant: "author"; author: AuthorIdentity };

/**
 * Tampon « De la collection / Auteur de la maison · Nuit d'Encre · Nº … »,
 * repris de la page d'import. Le libellé du haut varie selon la page.
 */
function Stamp({ label, code }: { label: string; code: string }) {
    return (
        <div className="pointer-events-none absolute -right-3 top-5 z-20 rotate-[8deg] select-none">
            <div className="border-primary/55 bg-ink/55 flex flex-col items-center gap-1 rounded-sm border-2 border-double px-3 py-2 shadow-[0_2px_10px_-4px_hsl(20_3%_4%/0.8)]">
                <span className="text-primary/60 text-xxxs tracking-caps font-mono uppercase">
                    {label}
                </span>
                <span className="text-primary/90 tracking-label font-mono text-xs font-medium uppercase">
                    Nuit&nbsp;d'Encre
                </span>
                <span className="bg-primary/35 h-px w-full" />
                <span className="text-primary/50 text-xxxs font-mono tracking-widest">
                    Nº&nbsp;{code}
                </span>
            </div>
        </div>
    );
}

function formatSince(createdAt?: string): string | null {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
    }).format(date);
}

/** Médaillon-monogramme « établi » de l'auteur (à défaut de photo). */
function AuthorMedallion({ author }: { author: AuthorIdentity }) {
    const initials = `${author.firstname[0] ?? ""}${author.lastname[0] ?? ""}`;
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-between bg-[radial-gradient(125%_82%_at_50%_6%,hsl(43_30%_20%)_0%,hsl(20_3%_13%)_52%,hsl(20_3%_9%)_100%)] px-6 py-7 text-center">
            <div className="border-primary/24 inset-2.75 pointer-events-none absolute rounded-sm border" />
            <span className="text-primary/55 font-quote text-xxs tracking-ornament uppercase">
                Nuit d'Encre
            </span>
            <div className="flex flex-col items-center gap-4">
                <div className="h-33 w-33 relative grid place-items-center rounded-full bg-[radial-gradient(circle_at_32%_26%,hsl(43_30%_34%),hsl(20_3%_12%)_80%)] shadow-[inset_0_0_0_1.5px_hsl(43_59%_81%/0.42),0_10px_26px_-10px_hsl(20_3%_3%/0.9)]">
                    <span className="border-primary/22 inset-2.25 absolute rounded-full border" />
                    <span className="text-primary font-quote text-5xl uppercase leading-none">
                        {initials}
                    </span>
                </div>
                <span className="bg-primary/45 h-px w-9" />
                <p className="text-foreground font-quote text-xl leading-[1.1]">
                    {author.firstname}
                    <br />
                    {author.lastname}
                </p>
            </div>
            <span className="bg-sunken/70 inset-ring inset-ring-primary/28 grid h-9 w-9 place-items-center rounded-full">
                <FaFeatherPointed
                    size={16}
                    className="text-primary/80"
                    aria-hidden="true"
                />
            </span>
        </div>
    );
}

/**
 * Couverture/visuel « établi » des fiches Détail. Même DA que la page d'import
 * (bordure pleine dorée, tampon, légende) déclinée par page :
 * - `book` : la couverture de l'ouvrage (image ou repli « Nuit d'Encre ») ;
 * - `author` : un frontispice-monogramme (jumeau, à défaut de photo).
 */
export default function EstablishedCover(props: EstablishedCoverProps) {
    if (props.variant === "author") {
        const { author } = props;
        const code = String(
            `${author.id}${author.lastname}`
                .split("")
                .reduce((acc, c) => acc + c.charCodeAt(0), 0) * 73,
        )
            .slice(-6)
            .padStart(6, "0");
        const since = formatSince(author.createdAt);

        return (
            <div className="max-w-75 relative mx-auto w-full">
                <div className="border-primary/85 aspect-2/3 shadow-cover relative overflow-hidden rounded-md border-2">
                    <span className="w-1.25 bg-scrim/40 pointer-events-none absolute left-0 top-0 z-10 h-full" />
                    <AuthorMedallion author={author} />
                    <Stamp label="Auteur de la maison" code={code} />
                </div>
                <p className="text-xxs text-subtle-foreground mt-4 text-center font-mono tracking-wide">
                    à la maison
                    {since && (
                        <>
                            {" depuis · "}
                            <span className="text-gold-muted">{since}</span>
                        </>
                    )}
                </p>
            </div>
        );
    }

    const { book } = props;
    const code =
        (book.isbn13 ?? "").replace(/[^0-9]/g, "").slice(-6) || "------";
    const author = `${book.author.firstname} ${book.author.lastname}`;
    const addedOn = formatSince(book.createdAt);

    return (
        <div className="max-w-75 relative mx-auto w-full">
            {/* l'ouvrage - bordure pleine dorée */}
            <div className="border-primary/85 aspect-2/3 shadow-cover relative overflow-hidden rounded-md border-2">
                <div className="bg-background absolute inset-0 overflow-hidden rounded-md">
                    {book.coverUrl ? (
                        <img
                            src={book.coverUrl}
                            alt={`Couverture de ${book.title}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <FallbackCover title={book.title} author={author} />
                    )}
                    {/* tranche / reliure */}
                    <span className="w-1.25 bg-scrim/40 pointer-events-none absolute left-0 top-0 h-full" />
                </div>

                <Stamp label="De la collection" code={code} />
            </div>

            {/* indication : dans la collection */}
            <p className="text-xxs text-subtle-foreground mt-4 text-center font-mono tracking-wide">
                dans la collection
                {addedOn && (
                    <>
                        {" · "}
                        <span className="text-gold-muted">
                            depuis {addedOn}
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}
