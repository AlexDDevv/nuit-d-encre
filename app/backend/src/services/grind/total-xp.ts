/**
 * XP cumulée depuis l'inscription. `User.xp` ne garde que l'XP du niveau en
 * cours : on lui ajoute le coût des niveaux franchis (100 × n pour passer le
 * niveau n), soit 100 + 200 + … + 100 × (niveau − 1) = 50 × niveau × (niveau − 1).
 * Même formule en SQL dans le classement (`TOTAL_XP_SQL`).
 */
export function totalXp(level: number, xp: number): number {
    return 50 * level * (level - 1) + xp;
}

/** `totalXp` pour une table `user` aliasée `u`. */
export const TOTAL_XP_SQL = `(50 * u."level" * (u."level" - 1) + u."xp")`;
