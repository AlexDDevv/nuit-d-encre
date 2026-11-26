import BookCover from "@/components/sections/book/BookCover";
import { FavoriteBookModalProps } from "@/types/types";

/** Carte de rappel de l'ouvrage à épingler (couverture + titre/auteur/méta). */
export default function FavoriteBookReminder({
    book,
}: {
    book: FavoriteBookModalProps["book"];
}) {
    const author = `${book.author.firstname} ${book.author.lastname}`;

    return (
        <div className="border-border bg-sunken/60 mt-6 flex w-full items-center gap-3.5 rounded-xl border px-3.5 py-3">
            <BookCover
                coverUrl={book.coverUrl}
                title={book.title}
                author={author}
                className="aspect-2/3 w-15 border-border sm:w-17 shrink-0 rounded-md border shadow-[0_10px_22px_-10px_hsl(20_3%_3%/0.9)]"
            />
            <div className="min-w-0 flex-1">
                <p className="text-primary/55 text-xxs font-mono uppercase tracking-[0.18em]">
                    Ouvrage à épingler
                </p>
                <h3 className="text-foreground font-quote mt-1 text-xl leading-tight">
                    {book.title}
                </h3>
                <p className="font-body text-muted-foreground mt-0.5 text-xs">
                    {author}
                </p>
                {(book.category?.name || book.publishedYear) && (
                    <p className="font-quote text-gold-muted mt-0.5 text-xs italic">
                        {[book.category?.name, book.publishedYear]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}
            </div>
        </div>
    );
}
