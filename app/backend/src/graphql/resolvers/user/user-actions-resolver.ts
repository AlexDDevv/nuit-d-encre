import { Arg, Authorized, Ctx, ID, Query, Resolver } from "type-graphql";
import { UserActions } from "../../../database/entities/user/user-actions";
import { AppError } from "../../../middlewares/error-handler";
import { Context, Roles } from "../../../types/types";
import { requireUser } from "../../../utils/current-user";

@Resolver(UserActions)
export class UserActionsResolver {
    @Authorized()
    @Query(() => [UserActions])
    async userActionsByUser(
        @Arg("id", () => ID) id: string,
        @Ctx() context: Context
    ): Promise<UserActions[]> {
        const currentUser = await requireUser(context);
        if (id !== currentUser.id && currentUser.role !== Roles.Admin) {
            throw new AppError("Non autorisé", 403, "ForbiddenError");
        }

        return UserActions.find({
            where: {
                user: { id },
            },
            relations: {
                user: true,
            },
        });
    }
}
