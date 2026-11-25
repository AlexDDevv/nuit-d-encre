import { Link } from "react-router-dom";
import { LuBookOpen } from "react-icons/lu";
import { slugify } from "@/lib/utils";
import type { AdminRecentActivity } from "@/types/types";
import { formatDate } from "@/components/sections/admin/adminFormat";
import DashBlock from "./DashBlock";

export default function RecentBooks({
    books,
}: {
    books: AdminRecentActivity["recentBooks"];
}) {
    return (
        <DashBlock icon={LuBookOpen} title="Livres ajoutés" meta="5 derniers">
            <ul className="divide-border/55 divide-y-2">
                {books.map((b) => (
                    <li
                        key={b.id}
                        className="hover:bg-muted/25 flex items-center gap-3.5 px-5 py-3 transition-colors"
                    >
                        <span className="border-border bg-linear-to-b from-secondary/30 to-popover text-xxs text-primary/55 grid h-11 w-8 shrink-0 place-items-center rounded-sm border-2">
                            ◆
                        </span>
                        <div className="min-w-0 flex-1">
                            <Link
                                to={`/books/${b.id}-${slugify(b.title)}`}
                                className="font-quote text-foreground hover:text-primary block truncate text-base"
                            >
                                {b.title}
                            </Link>
                            <span className="font-body text-muted-foreground block truncate text-xs">
                                {b.author.firstname} {b.author.lastname}
                            </span>
                        </div>
                        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                            {b.category && (
                                <span className="border-border bg-muted/70 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.12em]">
                                    {b.category.name}
                                </span>
                            )}
                            <span className="font-body text-muted-foreground/75 text-xs">
                                {formatDate(b.createdAt)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </DashBlock>
    );
}
