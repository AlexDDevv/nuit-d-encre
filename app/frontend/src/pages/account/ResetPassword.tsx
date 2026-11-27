import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LuArrowRight, LuLock } from "react-icons/lu";
import AuthShell from "@/components/sections/auth/AuthShell";
import AuthCardHeader from "@/components/sections/auth/AuthCardHeader";
import AuthNotice from "@/components/sections/auth/AuthNotice";
import PasswordStrengthMeter from "@/components/sections/auth/PasswordStrengthMeter";
import TextField from "@/components/sections/shared/fields/TextField";
import Button from "@/components/UI/Button/Button";
import { RESET_PASSWORD, WHOAMI } from "@/graphql/user/auth";
import { useToast } from "@/hooks/toast/useToast";
import { GRAPHQL_ERROR_CODES, hasGraphQLErrorCode } from "@/lib/graphqlErrors";
import { isPasswordStrong, PASSWORD_MAX_LENGTH } from "@/lib/password";
import { ResetPasswordForm } from "@/types/types";

/** Nouveau mot de passe depuis le lien reçu par email (`?token=…`). */
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [linkInvalid, setLinkInvalid] = useState(token === "");

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        mode: "onBlur",
        defaultValues: { newPassword: "", confirmPassword: "" },
    });
    // Toutes les sessions sont révoquées : WHOAMI rafraîchi déconnecte un
    // onglet qui serait resté ouvert.
    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
        refetchQueries: [WHOAMI],
    });

    const newPassword = watch("newPassword");
    const confirmPassword = watch("confirmPassword");

    const onSubmit: SubmitHandler<ResetPasswordForm> = async (formData) => {
        try {
            await resetPassword({
                variables: {
                    data: { token, newPassword: formData.newPassword },
                },
            });
            showToast({
                type: "success",
                title: "Mot de passe modifié",
                description:
                    "Connectez-vous avec votre nouveau mot de passe. Vos autres sessions ont été fermées.",
            });
            navigate("/connexion");
        } catch (err) {
            if (hasGraphQLErrorCode(err, GRAPHQL_ERROR_CODES.invalidToken)) {
                setLinkInvalid(true);
                return;
            }
            showToast({
                type: "error",
                title: hasGraphQLErrorCode(
                    err,
                    GRAPHQL_ERROR_CODES.tooManyRequests,
                )
                    ? "Trop de tentatives"
                    : "La modification a échoué",
                description: "Patientez quelques minutes avant de réessayer.",
            });
        }
    };

    return (
        <AuthShell mode="connexion" onSubmit={handleSubmit(onSubmit)}>
            <AuthCardHeader
                welcome="Une clé neuve pour la bibliothèque."
                eyebrow="Nouveau mot de passe"
            />

            <div className="mt-6 flex flex-col gap-4">
                {linkInvalid ? (
                    <>
                        <AuthNotice
                            state="error"
                            title="Lien invalide ou expiré"
                        >
                            Ce lien a déjà servi, a expiré (il vaut 60 minutes)
                            ou est incomplet. Demandez-en un nouveau.
                        </AuthNotice>
                        <Button
                            to="/mot-de-passe-oublie"
                            variant="primary"
                            fullWidth
                            ariaLabel="Demander un nouveau lien"
                            rightIcon={<LuArrowRight size={16} />}
                        >
                            Demander un nouveau lien
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-2.5">
                            <TextField<ResetPasswordForm>
                                name="newPassword"
                                autoComplete="new-password"
                                label="Nouveau mot de passe"
                                type="password"
                                icon={LuLock}
                                required
                                placeholder="••••••••"
                                register={register}
                                errors={errors}
                                rules={{
                                    required: "Le mot de passe est requis",
                                    maxLength: {
                                        value: PASSWORD_MAX_LENGTH,
                                        message: "255 caractères maximum.",
                                    },
                                    validate: (value) =>
                                        isPasswordStrong(value) ||
                                        "Le mot de passe ne remplit pas tous les critères.",
                                }}
                            />
                            <PasswordStrengthMeter value={newPassword} />
                        </div>
                        <TextField<ResetPasswordForm>
                            name="confirmPassword"
                            autoComplete="new-password"
                            label="Confirmer le mot de passe"
                            type="password"
                            icon={LuLock}
                            required
                            placeholder="Saisissez à nouveau"
                            success={
                                confirmPassword !== "" &&
                                confirmPassword === newPassword
                                    ? "Les deux mots de passe correspondent"
                                    : undefined
                            }
                            register={register}
                            errors={errors}
                            rules={{
                                required: "Veuillez confirmer le mot de passe",
                                maxLength: {
                                    value: PASSWORD_MAX_LENGTH,
                                    message: "255 caractères maximum.",
                                },
                                validate: (value) =>
                                    value === getValues("newPassword") ||
                                    "Les deux mots de passe ne correspondent pas.",
                            }}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                            ariaLabel="Enregistrer le nouveau mot de passe"
                            rightIcon={<LuArrowRight size={16} />}
                        >
                            Enregistrer
                        </Button>
                    </>
                )}
            </div>
        </AuthShell>
    );
}
