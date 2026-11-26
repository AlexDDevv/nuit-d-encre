/**
 * Vrai si la valeur est un ISBN-13 dont la clé de contrôle est juste : 13
 * chiffres, somme pondérée 1-3-1-3… (clé comprise) multiple de 10. Sert à
 * confirmer une saisie, pas à la refuser : le backend n'exige que 13 chiffres.
 */
export function hasValidIsbn13Checksum(value: string): boolean {
    if (!/^\d{13}$/.test(value)) return false;
    const sum = [...value].reduce(
        (acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3),
        0,
    );
    return sum % 10 === 0;
}
