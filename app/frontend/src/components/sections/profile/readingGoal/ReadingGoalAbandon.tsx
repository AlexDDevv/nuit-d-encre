import Banner from "@/components/UI/Banner/Banner";
import Button from "@/components/UI/Button";
import { booksWord } from "@/lib/readingGoal";
import { ReadingGoalAbandonProps } from "@/types/types";

/** Confirmation en ligne de l'abandon : rappelle ce qui est perdu et ce qui reste. */
export default function ReadingGoalAbandon({
    goal,
    loading,
    onKeep,
    onConfirm,
}: ReadingGoalAbandonProps) {
    return (
        <Banner
            variant="error"
            icon="alertTriangle"
            title={`Abandonner le défi ${goal.year} ?`}
        >
            <p>
                Le serment de {goal.target} {booksWord(goal.target)} disparaîtra
                de votre profil et les {goal.rewardXp} XP promis à l'arrivée ne
                seront plus en jeu.{" "}
                <strong className="text-primary">
                    L'XP déjà gagnée reste acquise
                </strong>
                , et vos {goal.booksRead} {booksWord(goal.booksRead)} restent
                dans votre bibliothèque.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onKeep}
                    disabled={loading}
                >
                    Garder mon serment
                </Button>
                <Button
                    variant="destructiveGhost"
                    size="sm"
                    onClick={onConfirm}
                    loading={loading}
                >
                    Oui, abandonner
                </Button>
            </div>
        </Banner>
    );
}
