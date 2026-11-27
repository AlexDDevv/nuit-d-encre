import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { LuArrowLeft, LuArrowRight, LuMail } from "react-icons/lu";
import AuthShell from "@/components/sections/auth/AuthShell";
import AuthCardHeader from "@/components/sections/auth/AuthCardHeader";
import AuthNotice from "@/components/sections/auth/AuthNotice";
import { EMAIL_RULES } from "@/components/sections/auth/emailRules";
import TextField from "@/components/sections/shared/fields/TextField";
import Button from "@/components/UI/Button/Button";
import { REQUEST_PASSWORD_RESET } from "@/graphql/user/auth";
import { useToast } from "@/hooks/toast/useToast";
import { GRAPHQL_ERROR_CODES, hasGraphQLErrorCode } from "@/lib/graphqlErrors";
import { EmailRequestForm } from "@/types/types";

/** Demande d'un lien de réinitialisation du mot de passe. */
export default function ForgotPassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailRequestForm>({
        mode: "onBlur",
        defaultValues: { email: "" },
    });
    const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const { showToast } = useToast();

    const onSubmit: SubmitHandler<EmailRequestForm> = async ({ email }) => {
        try {
            await requestReset({ variables: { data: { email } } });
            setSentTo(email);
        } catch (err) {
            showToast({
                type: "error",
                title: hasGraphQLErrorCode(
                    err,
                    GRAPHQL_ERROR_CODES.tooManyRequests,
                )
                    ? "Trop de demandes"
                    : "La demande a échoué",
                description: "Patientez quelques minutes avant de réessayer.",
            });
        }
    };

    return (
        <AuthShell mode="connexion" onSubmit={handleSubmit(onSubmit)}>
            <AuthCardHeader
                welcome="Une clé perdue se remplace : nous vous en envoyons une neuve."
                eyebrow="Mot de passe oublié"
            />

            <div className="mt-6 flex flex-col gap-4">
                {sentTo ? (
                    <AuthNotice state="info" title="Vérifiez votre boîte mail">
                        Si un compte existe pour <strong>{sentTo}</strong>, un
                        lien pour choisir un nouveau mot de passe vient de
                        partir. Il est valable 60 minutes. Pensez à regarder
                        dans les indésirables.
                    </AuthNotice>
                ) : (
                    <>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Indiquez l'adresse de votre compte. Vous recevrez un
                            lien pour choisir un nouveau mot de passe.
                        </p>
                        <TextField<EmailRequestForm>
                            name="email"
                            label="Email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            icon={LuMail}
                            required
                            placeholder="vous@exemple.fr"
                            register={register}
                            errors={errors}
                            rules={EMAIL_RULES}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                            ariaLabel="Recevoir un lien de réinitialisation"
                            rightIcon={<LuArrowRight size={16} />}
                        >
                            Recevoir un lien
                        </Button>
                    </>
                )}

                <Button
                    to="/connexion"
                    variant="ghost"
                    ariaLabel="Retour à la connexion"
                    leftIcon={<LuArrowLeft size={14} />}
                    className="self-center text-sm"
                >
                    Retour à la connexion
                </Button>
            </div>
        </AuthShell>
    );
}
