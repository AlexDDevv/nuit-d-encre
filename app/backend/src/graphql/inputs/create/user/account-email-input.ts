import { IsEmail, IsStrongPassword, Length, MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import {
    PASSWORD_MAX_LENGTH,
    STRONG_PASSWORD_OPTIONS,
} from "../../../../utils/password-policy";

/** Adresse à laquelle renvoyer un lien (vérification, mot de passe oublié). */
@InputType()
export class EmailRequestInput {
    @Field()
    @IsEmail({}, { message: "The email must be valid." })
    @MaxLength(254)
    email!: string;
}

/** Jeton reçu par email (base64url de 32 octets : 43 caractères). */
@InputType()
export class EmailTokenInput {
    @Field()
    @Length(1, 128)
    token!: string;
}

@InputType()
export class ResetPasswordInput extends EmailTokenInput {
    @Field()
    @Length(8, PASSWORD_MAX_LENGTH, {
        message: "The password must contain between 8 and 255 characters.",
    })
    @IsStrongPassword(STRONG_PASSWORD_OPTIONS, {
        message:
            "The password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.",
    })
    newPassword!: string;
}
