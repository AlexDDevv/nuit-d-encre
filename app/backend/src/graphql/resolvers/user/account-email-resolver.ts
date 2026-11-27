import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { enforceRateLimit } from "../../../middlewares/rate-limiter";
import {
    requestPasswordReset,
    requestVerificationEmail,
    resetPassword,
    verifyEmail,
} from "../../../services/account-email-service";
import { Context } from "../../../types/types";
import {
    EmailRequestInput,
    EmailTokenInput,
    ResetPasswordInput,
} from "../../inputs/create/user/account-email-input";

/**
 * Lancé sans attendre : la réponse part avant l'envoi, que le compte existe
 * ou non, et sa durée ne trahit donc pas l'existence d'un compte.
 */
const inBackground = (label: string, task: Promise<void>): void => {
    task.catch((error) => console.error(`${label} failed:`, error));
};

/**
 * Liens envoyés par email : vérification de l'adresse et mot de passe oublié.
 * Mutations publiques (le compte non vérifié ne peut pas se connecter), sans
 * session ni donnée renvoyée.
 */
@Resolver()
export class AccountEmailResolver {
    /** Renvoie le lien de vérification. Toujours `true`, compte connu ou non. */
    @Mutation(() => Boolean)
    async resendVerificationEmail(
        @Arg("data") data: EmailRequestInput,
        @Ctx() context: Context,
    ): Promise<boolean> {
        enforceRateLimit("emailRequest", context.ip);
        inBackground(
            "Verification email",
            requestVerificationEmail(data.email),
        );
        return true;
    }

    @Mutation(() => Boolean)
    async verifyEmail(
        @Arg("data") data: EmailTokenInput,
        @Ctx() context: Context,
    ): Promise<boolean> {
        enforceRateLimit("emailToken", context.ip);
        await verifyEmail(data.token);
        return true;
    }

    /** Envoie le lien de réinitialisation. Toujours `true`, compte connu ou non. */
    @Mutation(() => Boolean)
    async requestPasswordReset(
        @Arg("data") data: EmailRequestInput,
        @Ctx() context: Context,
    ): Promise<boolean> {
        enforceRateLimit("emailRequest", context.ip);
        inBackground("Password reset email", requestPasswordReset(data.email));
        return true;
    }

    @Mutation(() => Boolean)
    async resetPassword(
        @Arg("data") data: ResetPasswordInput,
        @Ctx() context: Context,
    ): Promise<boolean> {
        enforceRateLimit("emailToken", context.ip);
        await resetPassword(data.token, data.newPassword);
        return true;
    }
}
