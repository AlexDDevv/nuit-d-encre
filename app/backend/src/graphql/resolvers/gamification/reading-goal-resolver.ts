import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Query,
    Resolver,
} from "type-graphql";
import { ReadingGoal } from "../../../database/entities/gamification/reading-goal";
import { User } from "../../../database/entities/user/user";
import { ReadingGoalProgress } from "../../../database/filteredResults/gamification/reading-goal-progress";
import { AppError } from "../../../middlewares/error-handler";
import {
    checkReadingGoal,
    countBooksReadInYear,
    readingGoalXp,
} from "../../../services/gamification/reading-goal-service";
import { Context } from "../../../types/types";
import { requireUser } from "../../../utils/current-user";
import { parisYear } from "../../../utils/paris-date";
import { canViewLibrary } from "../../../utils/visibility";
import { SetReadingGoalInput } from "../../inputs/create/gamification/set-reading-goal-input";

async function toProgress(
    userId: string,
    goal: ReadingGoal,
): Promise<ReadingGoalProgress> {
    return {
        year: goal.year,
        target: goal.target,
        booksRead: await countBooksReadInYear(userId, goal.year),
        rewardXp: readingGoalXp(goal.target),
    };
}

@Resolver()
export class ReadingGoalResolver {
    /**
     * Défi de l'année en cours : le sien par défaut, ou celui de `userId`.
     * La progression révèle le contenu de la bibliothèque : celui d'un autre
     * n'est visible que s'il la partage (null sinon, ou sans défi).
     */
    @Authorized()
    @Query(() => ReadingGoalProgress, { nullable: true })
    async readingGoal(
        @Ctx() context: Context,
        @Arg("userId", () => ID, { nullable: true }) userId?: string,
    ): Promise<ReadingGoalProgress | null> {
        const viewer = await requireUser(context);
        let ownerId = viewer.id;

        if (userId && userId !== viewer.id) {
            const owner = await User.findOne({
                where: { id: userId },
                select: { id: true, isLibraryPublic: true },
            });
            if (!owner)
                throw new AppError("User not found", 404, "NotFoundError");
            if (!canViewLibrary(viewer, owner)) return null;
            ownerId = owner.id;
        }

        const goal = await ReadingGoal.findOne({
            where: { user: { id: ownerId }, year: parisYear() },
        });
        return goal ? toProgress(ownerId, goal) : null;
    }

    /** Fixe (ou modifie) l'objectif de l'année en cours. */
    @Authorized()
    @Mutation(() => ReadingGoalProgress)
    async setReadingGoal(
        @Arg("data", () => SetReadingGoalInput) data: SetReadingGoalInput,
        @Ctx() context: Context,
    ): Promise<ReadingGoalProgress> {
        const user = await requireUser(context);
        const year = parisYear();

        const goal =
            (await ReadingGoal.findOne({
                where: { user: { id: user.id }, year },
            })) ?? Object.assign(new ReadingGoal(), { user, year });
        goal.target = data.target;
        await goal.save();

        await checkReadingGoal(user);
        return toProgress(user.id, goal);
    }

    /** Abandonne le défi de l'année en cours. L'XP déjà gagnée reste acquise. */
    @Authorized()
    @Mutation(() => Boolean)
    async clearReadingGoal(@Ctx() context: Context): Promise<boolean> {
        const user = await requireUser(context);
        await ReadingGoal.delete({ user: { id: user.id }, year: parisYear() });
        return true;
    }
}
