import { RefObject } from "react";

/** Segment d'un texte de critique ou de commentaire, en clair ou masqué. */
export type SpoilerSegment = {
    type: "text" | "spoiler";
    value: string;
};

/** Texte après insertion d'un spoiler, et sélection à rétablir. */
export type SpoilerWrapResult = {
    value: string;
    selectionStart: number;
    selectionEnd: number;
};

export type SpoilerPassageProps = {
    value: string;
};

export type SpoilerTextProps = {
    text: string;
};

export type SpoilerButtonProps = {
    /** Zone de texte dont la sélection est masquée. */
    textareaRef: RefObject<HTMLTextAreaElement | null>;
};
