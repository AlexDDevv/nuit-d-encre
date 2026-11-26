import { cn } from "@/lib/utils";
import { monogram } from "@/lib/leaderboard";
import { LeaderboardAvatarProps } from "@/types/types";

/**
 * Médaillon d'un lecteur classé : son avatar, sinon son monogramme en serif
 * sur fond brun doré. Taille et anneau donnés par l'appelant.
 */
export default function LeaderboardAvatar({
    userName,
    avatar,
    className,
    style,
}: LeaderboardAvatarProps) {
    return (
        <span
            aria-hidden="true"
            style={style}
            className={cn(
                "bg-secondary text-secondary-foreground font-quote inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
                className,
            )}
        >
            {avatar ? (
                <img
                    src={avatar}
                    alt=""
                    className="h-full w-full object-cover"
                />
            ) : (
                monogram(userName)
            )}
        </span>
    );
}
