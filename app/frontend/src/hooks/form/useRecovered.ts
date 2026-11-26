import { useState } from "react";

/**
 * Vrai quand un champ a été en erreur puis ne l'est plus : il passe alors en
 * état succès pour confirmer que la correction est prise. Un champ vidé ne
 * compte pas comme corrigé (cas des champs facultatifs).
 */
export function useRecovered(error: string | undefined, filled: boolean) {
    const [hadError, setHadError] = useState(false);
    if (error && !hadError) setHadError(true);
    return hadError && !error && filled;
}
