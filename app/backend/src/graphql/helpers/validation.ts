import { ValidateIf } from "class-validator";

/**
 * Champ optionnel : ignoré s'il est absent, null ou vide (les formulaires
 * envoient "" pour un champ laissé vierge), validé sinon. Remplace
 * `@IsOptional()` quand la chaîne vide doit compter comme « non renseigné ».
 */
export const SkipIfEmpty = () =>
    ValidateIf((_object, value) => value !== "" && value != null);

/**
 * Options `@IsUrl` des liens externes affichés en `href` : protocole
 * obligatoire et limité à http(s) (pas de `javascript:`, `data:`, ni d'URL
 * sans schéma interprétée comme chemin relatif).
 */
export const EXTERNAL_URL_OPTIONS = {
    protocols: ["http", "https"],
    require_protocol: true,
};

/**
 * Chemin interne de l'application (« /books »). Exclut « //domaine » et
 * « /\domaine », que le navigateur interprète comme une URL externe.
 */
export const isInternalPath = (value: string): boolean =>
    /^\/(?![/\\])/.test(value);
