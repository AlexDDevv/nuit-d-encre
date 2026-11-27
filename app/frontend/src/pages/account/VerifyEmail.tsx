import { useEffect, useRef, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { LuArrowRight, LuMail } from "react-icons/lu";
import AuthShell from "@/components/sections/auth/AuthShell";
import AuthCardHeader from "@/components/sections/auth/AuthCardHeader";
import AuthNotice from "@/components/sections/auth/AuthNotice";
import { EMAIL_RULES } from "@/components/sections/auth/emailRules";
import TextField from "@/components/sections/shared/fields/TextField";
import Button from "@/components/UI/Button/Button";
import { NocturneLoader } from "@/components/UI/loader";
import { RESEND_VERIFICATION_EMAIL, VERIFY_EMAIL } from "@/graphql/user/auth";
import { useToast } from "@/hooks/toast/useToast";
import { GRAPHQL_ERROR_CODES, hasGraphQLErrorCode } from "@/lib/graphqlErrors";
import { EmailRequestForm } from "@/types/types";

type Status = "pending" | "verified" | "invalid";

/** Confirmation de l'adresse depuis le lien reçu par email (`?token=…`). */
export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const client = useApolloClient();
    const [status, setStatus] = useState<Status>(token ? "pending" : "invalid");
    const [resendTo, setResendTo] = useState<string | null>(null);
    const [resend, { loading: resending }] = useMutation(
        RESEND_VERIFICATION_EMAIL,
    );
    const { showToast } = useToast();
    // Le jeton ne sert qu'une fois : le double effet du StrictMode le
    // consommerait puis afficherait « lien invalide ».
    const started = useRef(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailRequestForm>({
        mode: "onBlur",
        defaultValues: { email: "" },
    });

    useEffect(() => {
        if (!token || started.current) return;
        started.current = true;
        client
            .mutate({ mutation: VERIFY_EMAIL, variables: { data: { token } } })
            .then(() => setStatus("verified"))
            .catch(() => setStatus("invalid"));
    }, [client, token]);

    const onSubmit: SubmitHandler<EmailRequestForm> = async ({ email }) => {
        try {
            await resend({ variables: { data: { email } } });
            setResendTo(email);
        } catch (err) {
            showToast({
                type: "error",
                title: hasGraphQLErrorCode(
                    err,
                    GRAPHQL_ERROR_CODES.tooManyRequests,
                )
                    ? "Trop de demandes"
                    : "Envoi impossible",
                description: "Patientez quelques minutes avant de réessayer.",
            });
        }
    };

    return (
        <AuthShell mode="connexion" onSubmit={handleSubmit(onSubmit)}>
            <AuthCardHeader
                welcome="Un dernier sceau sur votre carte d'accès."
                eyebrow="Confirmation"
            />

            <div className="mt-6 flex flex-col gap-4">
                {status === "pending" && (
                    <NocturneLoader concept="medaillon" label />
                )}

                {status === "verified" && (
                    <>
                        <AuthNotice state="success" title="Adresse confirmée">
                            Votre compte est actif. Vous pouvez vous connecter.
                        </AuthNotice>
                        <Button
                            to="/connexion"
                            variant="primary"
                            fullWidth
                            ariaLabel="Se connecter à Nuit d'Encre"
                            rightIcon={<LuArrowRight size={16} />}
                        >
                            Se connecter
                        </Button>
                    </>
                )}

                {status === "invalid" && (
                    <>
                        <AuthNotice
                            state="error"
                            title="Lien invalide ou expiré"
                        >
                            Ce lien a déjà servi, a expiré (il vaut 24 heures)
                            ou est incomplet. Si votre adresse est déjà
                            confirmée, connectez-vous ; sinon, demandez un
                            nouveau lien.
                        </AuthNotice>
                        {resendTo ? (
                            <AuthNotice
                                state="info"
                                title="Vérifiez votre boîte mail"
                            >
                                Si <strong>{resendTo}</strong> attend sa
                                confirmation, un nouveau lien vient de partir.
                            </AuthNotice>
                        ) : (
                            <>
                                <TextField<EmailRequestForm>
                                    name="email"
                                    label="Email du compte"
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
                                    variant="outline"
                                    fullWidth
                                    loading={resending}
                                    disabled={resending}
                                    ariaLabel="Recevoir un nouveau lien"
                                >
                                    Recevoir un nouveau lien
                                </Button>
                            </>
                        )}
                        <Button
                            to="/connexion"
                            variant="ghost"
                            ariaLabel="Aller à la connexion"
                            className="self-center text-sm"
                        >
                            Aller à la connexion
                        </Button>
                    </>
                )}
            </div>
        </AuthShell>
    );
}
