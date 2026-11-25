import { Arg, Authorized, Ctx, ID, Query, Resolver } from "type-graphql";
import { User } from "../../../database/entities/user/user";
import { UserActions } from "../../../database/entities/user/user-actions";
import { AppError } from "../../../middlewares/error-handler";
import { Context } from "../../../types/types";
import { requireUser } from "../../../utils/current-user";
import { onlyVisibleActions } from "../../../utils/visibility";

@Resolver(UserActions)
export class UserActionsResolver {
    /**
     * Journal d'activité d'un profil (statistiques et activité de la page
     * profil). Public pour tout utilisateur connecté, comme le fil : les
     * actions de bibliothèque d'un compte qui ne la partage pas sont retirées
     * pour les autres (utils/visibility.ts).
     */
    @Authorized()
    @Query(() => [UserActions])
    async userActionsByUser(
        @Arg("id", () => ID) id: string,
        @Ctx() context: Context,
    ): Promise<UserActions[]> {
        const viewer = await requireUser(context);

        const exists = await User.exists({ where: { id } });
        if (!exists) throw new AppError("User not found", 404, "NotFoundError");

        const qb = UserActions.createQueryBuilder("action")
            .innerJoin("action.user", "user")
            .where("user.id = :id", { id })
            .orderBy("action.createdAt", "DESC");

        return onlyVisibleActions(qb, viewer, "action", "user").getMany();
    }
}
