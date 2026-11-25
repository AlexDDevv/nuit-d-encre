import { AppError } from "../middlewares/error-handler";

/** ISBN-13 stocké : 13 chiffres, sans tiret ni espace. */
export const ISBN13_PATTERN = /^\d{13}$/;

/**
 * Normalise un ISBN-13 saisi ou reçu en argument (« 978-2-07-036822-8 » →
 * « 9782070368228 ») et le refuse s'il n'est pas composé de 13 chiffres.
 * Indispensable avant de l'insérer dans une URL d'API externe ou de
 * l'enregistrer.
 */
export function normalizeIsbn13(raw: string): string {
    const value = raw.replace(/[-\s]/g, "");
    if (!ISBN13_PATTERN.test(value)) {
        throw new AppError("ISBN-13 invalide : 13 chiffres attendus", 400, "ValidationError");
    }
    return value;
}
