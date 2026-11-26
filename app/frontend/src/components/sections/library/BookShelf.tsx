import { Link } from "react-router-dom";
import { FaStar, FaQuoteLeft, FaHeart } from "react-icons/fa6";
import { LuCalendarCheck } from "react-icons/lu";
import { Tooltip } from "@/components/UI/Tooltip/Tooltip";
import BookCover from "@/components/sections/book/BookCover";
import BookCardRating from "@/components/sections/book/BookCard/BookCardRating";
import { cn, slugify } from "@/lib/utils";
import { formatReadingDate } from "@/lib/readingDate";
import { BOOK_STATES, STATUS_COLORS } from "@/constants/bookStatus";
import { BookShelfProps } from "@/types/types";

export default function BookShelf({
    book,
    status,
    finishedAt,
    isFavorite = false,
    favoriteRank = null,
}: BookShelfProps) {
    const author = `${book.author.firstname} ${book.author.lastname}`;
    const bookPath = `/books/${book.id}-${slugify(book.title)}`;
    const statusConfig = BOOK_STATES.find((s) => s.value === status);
    const StatusIcon = statusConfig?.icon;
    const reviewCount = book.reviewCount ?? 0;
    const recoCount = book.recommendationCount ?? 0;

    const tooltipContent = (
        <div className="flex flex-col gap-1.5 text-left">
            <h3 className="text-foreground font-quote text-base leading-tight">
                {book.title}
            </h3>
            <p className="text-muted-foreground font-body text-xs">{author}</p>
            <p className="font-quote text-gold-muted text-xs italic">
                {book.category?.name} · {book.publishedYear}
            </p>
            {status === "READ" && finishedAt && (
                <p className="text-muted-foreground font-body inline-flex items-center gap-1.5 text-xs">
                    <LuCalendarCheck
                        size={12}
                        className="text-primary/60"
                        aria-hidden="true"
                    />
                    Lu le {formatReadingDate(finishedAt)}
                </p>
            )}
            <span className="bg-primary/20 my-1.5 h-px w-full" />
            <BookCardRating
                averageRating={book.averageRating}
                reviewCount={book.reviewCount}
            />
            <div className="text-muted-foreground text-xxs mt-1 flex items-center gap-4 font-mono">
                <span className="inline-flex items-center gap-1.5">
                    <FaQuoteLeft
                        size={11}
                        className="text-primary/60"
                        aria-hidden="true"
                    />
                    {reviewCount} critique{reviewCount > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <FaHeart
                        size={11}
                        className="text-primary/60"
                        aria-hidden="true"
                    />
                    {recoCount} reco{recoCount > 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col">
            <Tooltip
                content={tooltipContent}
                position="top"
                delay={200}
                gap={20}
                fullWidth={false}
                className="border-primary/40 bg-popover text-popover-foreground w-60 border-2 p-3.5"
            >
                <Link
                    to={bookPath}
                    aria-label={`${book.title}, ${author} - ${statusConfig?.label ?? ""}`}
                    className="focus-visible:ring-ring group relative block w-28 rounded-md focus-visible:outline-none focus-visible:ring-2"
                >
                    <div className="bg-background border-border group-hover:border-primary/55 aspect-4/5 relative overflow-hidden rounded-md border-2 shadow-lg transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.8)]">
                        <BookCover
                            coverUrl={book.coverUrl}
                            title={book.title}
                            author={author}
                            compact
                            className="absolute inset-0"
                        />
                        {/* tranche / reliure */}
                        <span className="w-1.25 pointer-events-none absolute left-0 top-0 h-full bg-[linear-gradient(to_right,hsl(20_3%_6%/0.55),transparent)]" />
                        {/* voile + statut incrusté */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-[linear-gradient(to_top,hsl(20_3%_7%/0.92),transparent)] pb-2 pt-7">
                            <span
                                className={cn(
                                    "font-body text-xxs inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-bold backdrop-blur-sm",
                                    STATUS_COLORS[status].chip,
                                )}
                            >
                                {StatusIcon && (
                                    <StatusIcon className="h-2.5 w-2.5" />
                                )}
                                {statusConfig?.label}
                            </span>
                        </div>
                        {/* favori */}
                        {isFavorite && (
                            <span
                                className="bg-primary text-primary-foreground py-0.75 text-xxs absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 font-mono font-medium shadow-sm"
                                title={`Favori · rang ${favoriteRank}`}
                            >
                                <FaStar size={10} aria-hidden="true" />{" "}
                                {favoriteRank}
                            </span>
                        )}
                    </div>
                </Link>
            </Tooltip>

            {/* planche d'étagère - bois sombre */}
            <div className="rounded-xs relative mt-2 h-2.5 w-28 bg-[linear-gradient(to_bottom,hsl(28_34%_15%),hsl(24_44%_6%))] shadow-[0_7px_14px_-4px_hsl(20_3%_2%/0.9),inset_0_1px_0_hsl(43_45%_55%/0.18)]" />
        </div>
    );
}
