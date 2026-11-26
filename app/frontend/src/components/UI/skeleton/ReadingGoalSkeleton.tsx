import { Card } from "@/components/sections/profile/ProfileUI";
import { Skeleton } from "./Skeleton";

/** Squelette de la carte « Défi de lecture » du profil. */
export default function ReadingGoalSkeleton() {
    return (
        <Card
            glow={false}
            aria-busy="true"
            aria-label="Défi de lecture en cours de chargement"
            className="flex flex-col gap-6 p-5 md:p-6"
        >
            <div className="flex justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="max-w-85 h-5 w-3/5" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-6">
                <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-4">
                    <Skeleton className="w-35 h-16 rounded-lg" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-full rounded-full" />
                </div>
                <Skeleton className="min-h-37.5 flex-[1_1_240px] rounded-xl" />
            </div>
            <span className="sr-only">Chargement du défi de lecture…</span>
        </Card>
    );
}
