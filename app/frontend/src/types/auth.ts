import { FormEventHandler, ReactNode } from "react";

/** Mode d'un écran d'authentification (pages sœurs connexion / inscription). */
export type AuthMode = "connexion" | "inscription";

export interface EditorialPanelProps {
    mode: AuthMode;
}

export interface ContinueWithProps {
    /** Libellé central du séparateur orné (par défaut « ou »). */
    label?: string;
}

export interface AuthShellProps {
    mode: AuthMode;
    onSubmit: FormEventHandler<HTMLFormElement>;
    children: ReactNode;
}

export interface AuthCardHeaderProps {
    /** Accroche serif sous le titre. */
    welcome: string;
    /** Libellé mono de la page (ex. « Connexion »). */
    eyebrow: string;
}

export interface PasswordStrengthMeterProps {
    value: string;
}

export interface PasswordRule {
    id: string;
    label: string;
    test: (value: string) => boolean;
}

/** Variables de la mutation `googleAuth` (authorization code du flux OAuth). */
export interface GoogleAuthVariables {
    code: string;
}

/** Réponse de la mutation `googleAuth` (aligné sur le LogInResponse backend). */
export interface GoogleAuthResponse {
    googleAuth: {
        message: string;
        cookieSet: boolean;
    };
}

/** Encadré d'état des écrans d'authentification (lien envoyé, lien expiré…). */
export interface AuthNoticeProps {
    state: "info" | "success" | "warning" | "error";
    title: string;
    children?: ReactNode;
}

/** Bouton de renvoi du lien de vérification pour une adresse donnée. */
export interface ResendVerificationButtonProps {
    email: string;
}

/** Champ email seul (mot de passe oublié, renvoi du lien de vérification). */
export interface EmailRequestForm {
    email: string;
}

/** Nouveau mot de passe choisi depuis le lien reçu par email. */
export interface ResetPasswordForm {
    newPassword: string;
    confirmPassword: string;
}
