const PARIS = "Europe/Paris";

/** Date du jour à Paris, au format `YYYY-MM-DD` des colonnes `date`. */
export function parisToday(now: Date = new Date()): string {
    // en-CA formate en AAAA-MM-JJ.
    return new Intl.DateTimeFormat("en-CA", { timeZone: PARIS }).format(now);
}

/** Année en cours à Paris (le défi de lecture bascule à minuit, heure de Paris). */
export function parisYear(now: Date = new Date()): number {
    return Number(parisToday(now).slice(0, 4));
}

/** Format des dates de lecture échangées avec le front (colonnes `date`). */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
