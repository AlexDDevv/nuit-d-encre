import MailChecker from "mailchecker";

/**
 * Adresse d'un service d'emails jetables (liste `mailchecker`, environ 55 000
 * domaines). Premier filtre seulement : la vérification d'adresse reste la
 * vraie garantie. À appeler sur une adresse déjà validée par `@IsEmail`.
 */
export const isDisposableEmail = (email: string): boolean =>
    !MailChecker.isValid(email);
