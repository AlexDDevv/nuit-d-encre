/** Motif d'une URL externe exploitable : schéma http(s) et un domaine à point. */
const EXTERNAL_URL = /^https?:\/\/[^\s/.]+\.[^\s]+$/;

/** Vrai si la valeur ressemble à une URL externe complète (http ou https). */
export function isExternalUrl(value: string): boolean {
    return EXTERNAL_URL.test(value.trim());
}
