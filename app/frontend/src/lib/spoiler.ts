import { SpoilerSegment, SpoilerWrapResult } from "@/types/types";

export const SPOILER_MARK = "||";
const PLACEHOLDER = "spoiler";

/**
 * Découpe un texte en segments, les passages entourés de `||…||` devenant des
 * spoilers. Un marqueur sans fermeture, ou un spoiler vide ou blanc, reste du
 * texte. Aucun HTML n'est produit : le rendu se fait en éléments React.
 */
export function parseSpoilers(text: string): SpoilerSegment[] {
    const segments: SpoilerSegment[] = [];
    let buffer = "";
    let cursor = 0;

    while (cursor < text.length) {
        const open = text.indexOf(SPOILER_MARK, cursor);
        if (open === -1) break;
        const close = text.indexOf(SPOILER_MARK, open + SPOILER_MARK.length);
        if (close === -1) break;

        const inner = text.slice(open + SPOILER_MARK.length, close);
        if (inner.trim() === "") {
            buffer += text.slice(cursor, close);
            cursor = close;
            continue;
        }

        buffer += text.slice(cursor, open);
        if (buffer) segments.push({ type: "text", value: buffer });
        buffer = "";
        segments.push({ type: "spoiler", value: inner });
        cursor = close + SPOILER_MARK.length;
    }

    buffer += text.slice(cursor);
    if (buffer) segments.push({ type: "text", value: buffer });
    return segments;
}

/**
 * Entoure la sélection `[start, end)` de marqueurs de spoiler, ou insère un
 * spoiler d'exemple si rien n'est sélectionné. Renvoie le nouveau texte et la
 * sélection à rétablir, placée sur le passage masqué.
 */
export function wrapSpoiler(
    value: string,
    start: number,
    end: number,
): SpoilerWrapResult {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const selected = value.slice(from, to) || PLACEHOLDER;
    const innerStart = from + SPOILER_MARK.length;

    return {
        value:
            value.slice(0, from) +
            SPOILER_MARK +
            selected +
            SPOILER_MARK +
            value.slice(to),
        selectionStart: innerStart,
        selectionEnd: innerStart + selected.length,
    };
}
