/** Date du jour au format des `<input type="date">` (AAAA-MM-JJ, heure locale). */
export function todayInputValue(now: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** « 12 mars 2026 » à partir d'une date AAAA-MM-JJ, sans décalage de fuseau. */
export function formatReadingDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
