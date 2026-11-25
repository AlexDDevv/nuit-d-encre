/**
 * Taille de page maximale acceptée par toute liste publique. Sans plafond,
 * `limit: 100000` charge la table entière et tous ses FieldResolvers.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Borne `page` et `limit` pour les queries qui reçoivent la pagination en
 * arguments séparés (hors input validé par class-validator).
 */
export function clampPagination(
    page: number,
    limit: number,
): { page: number; limit: number } {
    return {
        page: Math.max(1, Math.floor(page) || 1),
        limit: Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit) || 1)),
    };
}
