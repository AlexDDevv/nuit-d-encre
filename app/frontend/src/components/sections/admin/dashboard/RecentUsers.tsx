import { LuUserPlus } from "react-icons/lu";
import type { AdminRecentActivity } from "@/types/types";
import { Avatar } from "@/components/sections/admin/ui/Avatar";
import { formatDate } from "@/components/sections/admin/adminFormat";
import DashBlock from "./DashBlock";

export default function RecentUsers({
    users,
}: {
    users: AdminRecentActivity["recentUsers"];
}) {
    return (
        <DashBlock
            icon={LuUserPlus}
            title="Inscriptions récentes"
            meta="5 derniers"
        >
            <ul className="divide-border/55 divide-y-2">
                {users.map((u) => (
                    <li
                        key={u.id}
                        className="hover:bg-muted/25 flex items-center gap-3.5 px-5 py-3 transition-colors"
                    >
                        <Avatar name={u.userName} avatar={u.avatar} size={40} />
                        <div className="min-w-0 flex-1">
                            <span className="font-body text-foreground truncate text-sm font-bold">
                                {u.userName}
                            </span>
                            <span className="font-body text-muted-foreground block truncate text-xs">
                                {u.email}
                            </span>
                        </div>
                        <span className="font-body text-muted-foreground/80 shrink-0 text-xs">
                            {formatDate(u.createdAt)}
                        </span>
                    </li>
                ))}
            </ul>
        </DashBlock>
    );
}
