import { useToast } from "@/hooks/toast/useToast";
import { UserSignUpForm } from "@/types/types";
import { ApolloError, useMutation } from "@apollo/client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import {
    LuArrowRight,
    LuCircleAlert,
    LuLock,
    LuMail,
    LuUser,
} from "react-icons/lu";
import TextField from "@/components/sections/shared/fields/TextField";
import PasswordStrengthMeter from "@/components/sections/auth/PasswordStrengthMeter";
import AuthShell from "@/components/sections/auth/AuthShell";
import AuthCardHeader from "@/components/sections/auth/AuthCardHeader";
import Button from "@/components/UI/Button/Button";
import ContinueWithGoogle from "@/components/UI/form/ContinueWithGoogle";
import { isPasswordStrong, PASSWORD_MAX_LENGTH } from "@/lib/password";
import { REGISTER } from "@/graphql/user/auth";
import AuthNotice from "@/components/sections/auth/AuthNotice";
import ResendVerificationButton from "@/components/sections/auth/ResendVerificationButton";
import { GRAPHQL_ERROR_CODES, hasGraphQLErrorCode } from "@/lib/graphqlErrors";

export default function Signup() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        getValues,
        setError,
        formState: { errors },
    } = useForm<UserSignUpForm>({
        mode: "onBlur",
        defaultValues: {
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    // Pas de session à l'inscription : le compte s'active par le lien reçu.
    const [Register] = useMutation(REGISTER);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const { showToast } = useToast();

    // Get the redirect URL from query params to pass it to the login page
    const redirectUrl = searchParams.get("redirect");
    const loginHref = redirectUrl
        ? `/connexion?redirect=${encodeURIComponent(redirectUrl)}`
        : "/connexion";

    const onSubmit: SubmitHandler<UserSignUpForm> = async (formData) => {
        try {
            const { data } = await Register({
                variables: {
                    data: {
                        email: formData.email,
                        password: formData.password,
                        userName: formData.userName,
                    },
                },
            });

            if (data) {
                reset();
                setSentTo(formData.email);
            }
        } catch (err) {
            console.error("Erreur complète :", err);

            // Handle GraphQL errors : invalid formats, email already used...
            if (
                hasGraphQLErrorCode(err, GRAPHQL_ERROR_CODES.badUserInput) &&
                err instanceof ApolloError &&
                err.graphQLErrors.some((e) => e.message.includes("Disposable"))
            ) {
                setError("email", {
                    message:
                        "Les adresses email temporaires ne sont pas acceptées.",
                });
                return;
            }

            if (err instanceof ApolloError) {
                const emailError = err.graphQLErrors.find((e) =>
                    e.message.includes("Email already exists"),
                );

                if (emailError) {
                    showToast({
                        type: "warning",
                        title: "Cette e-mail est déjà utilisée !",
                        description: "Choisissez une autre adresse e-mail.",
                    });
                    return;
                }
            }

            // Handle others errors
            console.error("Error:", err);
            showToast({
                type: "error",
                title: "Oops, nous avons rencontré un problème pour créer votre compte.",
                description: "Réessayer ultérieurement.",
            });
        }
    };

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    if (sentTo) {
        return (
            <AuthShell mode="inscription" onSubmit={(e) => e.preventDefault()}>
                <AuthCardHeader
                    welcome="Votre carte d'accès attend son sceau."
                    eyebrow="Inscription"
                />
                <div className="mt-6 flex flex-col gap-4">
                    <AuthNotice state="info" title="Vérifiez votre boîte mail">
                        <p>
                            Un lien de confirmation vient de partir vers{" "}
                            <strong>{sentTo}</strong>. Il est valable 24 heures.
                            Pensez à regarder dans les indésirables.
                        </p>
                        <div className="mt-3">
                            <ResendVerificationButton email={sentTo} />
                        </div>
                    </AuthNotice>
                    <Button
                        to={loginHref}
                        variant="primary"
                        fullWidth
                        ariaLabel="Aller à la connexion"
                        rightIcon={<LuArrowRight size={16} />}
                    >
                        J'ai confirmé, me connecter
                    </Button>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell mode="inscription" onSubmit={handleSubmit(onSubmit)}>
            <AuthCardHeader
                welcome="Faites-vous une place au coin du feu."
                eyebrow="Inscription"
            />

            {/* Champs */}
            <div className="mt-6 flex flex-col gap-4">
                <TextField<UserSignUpForm>
                    name="userName"
                    autoComplete="nickname"
                    label="Nom d'utilisateur"
                    icon={LuUser}
                    required
                    placeholder="Votre nom de plume"
                    register={register}
                    errors={errors}
                    rules={{
                        required: "Le nom d'utilisateur est requis",
                        minLength: {
                            value: 2,
                            message:
                                "Le nom d'utilisateur doit contenir au moins 2 caractères.",
                        },
                        maxLength: {
                            value: 100,
                            message:
                                "Le nom d'utilisateur doit contenir 100 caractères maximum.",
                        },
                    }}
                />
                <TextField<UserSignUpForm>
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
                    rules={{
                        required: "L'email est requis",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Format d'email invalide",
                        },
                        maxLength: {
                            value: 254,
                            message:
                                "Adresse trop longue (254 caractères maximum).",
                        },
                    }}
                />

                <div className="flex flex-col gap-2.5">
                    <TextField<UserSignUpForm>
                        name="password"
                        autoComplete="new-password"
                        label="Mot de passe"
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
                                isPasswordStrong(value as string) ||
                                "Le mot de passe ne remplit pas tous les critères.",
                        }}
                    />
                    <PasswordStrengthMeter value={password} />
                </div>

                <TextField<UserSignUpForm>
                    name="confirmPassword"
                    autoComplete="new-password"
                    label="Confirmer le mot de passe"
                    type="password"
                    icon={LuLock}
                    required
                    placeholder="Saisissez à nouveau"
                    success={
                        confirmPassword !== "" && confirmPassword === password
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
                            value === getValues("password") ||
                            "Les deux mots de passe ne correspondent pas.",
                    }}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground flex items-start gap-2 text-sm">
                        <input
                            type="checkbox"
                            {...register("acceptTerms", {
                                required:
                                    "Vous devez accepter les conditions pour créer un compte",
                            })}
                            aria-invalid={errors.acceptTerms ? "true" : "false"}
                            className="border-border bg-input accent-primary mt-1 size-4 shrink-0 rounded-sm border outline-none"
                        />
                        <span>
                            J'ai lu et j'accepte les{" "}
                            <Link
                                to="/terms-of-use"
                                className="text-primary underline"
                            >
                                mentions légales et la politique de
                                confidentialité
                            </Link>
                            .
                        </span>
                    </label>
                    {errors.acceptTerms && (
                        <span
                            role="alert"
                            className="text-error inline-flex items-center gap-1.5 text-xs"
                        >
                            <LuCircleAlert size={13} />{" "}
                            {errors.acceptTerms.message}
                        </span>
                    )}
                </div>

                <div className="mt-1">
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        ariaLabel="Créer un compte Nuit d'Encre"
                        rightIcon={<LuArrowRight size={16} />}
                    >
                        Créer mon compte
                    </Button>
                </div>
            </div>

            {/* Séparateur orné « ou » + bouton Google */}
            <ContinueWithGoogle />

            {/* Navigation vers la page de connexion */}
            <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
                <p className="font-quote text-muted-foreground/75 text-sm italic leading-relaxed">
                    Déjà une carte d'accès ?{" "}
                    <Link
                        to={loginHref}
                        className="text-primary decoration-primary/40 focus-visible:ring-primary/70 hover:text-gold-bright hover:decoration-primary rounded-sm font-medium not-italic underline underline-offset-[3px] transition-colors focus:outline-none focus-visible:ring-2"
                    >
                        Se connecter
                    </Link>
                    .
                </p>
            </div>
        </AuthShell>
    );
}
