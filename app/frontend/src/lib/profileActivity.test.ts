import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserAction, UserActionType } from "@/types/types";
import {
    computeStats,
    describeAction,
    formatRelativeDate,
    sortByRecent,
    timeBucket,
} from "./profileActivity";

const NOW = new Date("2026-06-15T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Date ISO située `ms` millisecondes avant l'horloge figée des tests. */
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const action = (
    type: UserActionType,
    metadata: string | null = null,
    createdAt = ago(0),
): UserAction => ({ type, xp: 0, createdAt, metadata });

// Risque : les compteurs du profil comptent une action qui ne leur revient pas.
describe("computeStats", () => {
    it("part de zéro sans action", () => {
        expect(computeStats([])).toEqual({
            added: 0,
            finished: 0,
            reviews: 0,
            authors: 0,
            recommendations: 0,
        });
    });

    it("compte une action par compteur du profil", () => {
        expect(
            computeStats([
                action("BOOK_ADDED"),
                action("BOOK_ADDED"),
                action("BOOK_FINISHED"),
                action("REVIEW_CREATED"),
                action("AUTHOR_ADDED"),
                action("BOOK_RECOMMENDED"),
            ]),
        ).toEqual({
            added: 2,
            finished: 1,
            reviews: 1,
            authors: 1,
            recommendations: 1,
        });
    });

    it.each<UserActionType>([
        "BOOK_ADDED_TO_LIBRARY",
        "DETAILED_REVIEW_BONUS",
        "REVIEW_VOTED_HELPFUL",
        "BOOK_IMPORTED",
        "BOOK_COMPLETED",
        "AUTHOR_COMPLETED",
    ])("ignore %s, qui n'alimente aucun compteur affiché", (type) => {
        expect(computeStats([action(type)])).toEqual(computeStats([]));
    });
});

// Risque : un type d'action nouveau ou des métadonnées corrompues font planter
// le journal du profil et le fil.
describe("describeAction", () => {
    it.each([
        ["illisibles", "{pas du json"],
        ["non objet", '"Dune"'],
        ["nulles", null],
    ])("survit à des métadonnées %s", (_label, metadata) => {
        expect(describeAction(action("BOOK_ADDED", metadata)).label).toBe(
            "A ajouté un ouvrage",
        );
    });

    it("retombe sur un libellé neutre pour un type inconnu du front", () => {
        // Un nouveau UserActionType ajouté côté backend ne doit pas casser le
        // journal : il s'affiche en « a gagné de l'expérience ».
        expect(
            describeAction(action("BOOK_UNSHELVED" as UserActionType)),
        ).toEqual({ label: "A gagné de l'expérience", kind: "added" });
    });
});

// Risque : une action glisse dans le mauvais groupe de dates aux bornes
// (24 h, 48 h, 7 jours) ou une date invalide casse l'affichage.
describe("dates", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("timeBucket", () => {
        it.each([
            ["à l'instant", 0, "today", "Aujourd'hui"],
            ["il y a 23 h", 23 * HOUR_MS, "today", "Aujourd'hui"],
            ["il y a 25 h", DAY_MS + HOUR_MS, "yesterday", "Hier"],
            ["il y a 3 jours", 3 * DAY_MS, "week", "Cette semaine"],
            ["il y a 8 jours", 8 * DAY_MS, "earlier", "Plus tôt"],
        ])("range %s dans %s", (_label, age, key, label) => {
            expect(timeBucket(ago(age))).toEqual({ key, label });
        });

        it.each([
            ["24 h pile bascule sur Hier", DAY_MS, "yesterday"],
            ["48 h pile bascule sur Cette semaine", 2 * DAY_MS, "week"],
            ["7 jours pile bascule sur Plus tôt", 7 * DAY_MS, "earlier"],
        ])("%s", (_label, age, key) => {
            expect(timeBucket(ago(age)).key).toBe(key);
        });
    });

    describe("formatRelativeDate", () => {
        it.each([
            ["hier", DAY_MS, "hier"],
            ["3 semaines", 21 * DAY_MS, "il y a 3 semaines"],
            // 365 jours retombe sur « 12 mois » : les divisions cumulées
            // (7 jours, 4,34524 semaines, 12 mois) n'atteignent pas tout à
            // fait l'année.
            ["1 an", 365 * DAY_MS, "il y a 12 mois"],
        ])("formate %s en français", (_label, age, expected) => {
            expect(formatRelativeDate(ago(age))).toBe(expected);
        });

        it("renvoie une chaîne vide pour une date invalide", () => {
            expect(formatRelativeDate("pas une date")).toBe("");
            expect(formatRelativeDate("")).toBe("");
        });
    });
});

// Risque : trier en place le tableau figé renvoyé par Apollo lève une erreur.
describe("sortByRecent", () => {
    it("classe de la plus récente à la plus ancienne", () => {
        const recent = action("BOOK_ADDED", null, "2026-06-15T10:00:00.000Z");
        const older = action("BOOK_ADDED", null, "2026-06-01T10:00:00.000Z");
        const oldest = action("BOOK_ADDED", null, "2025-12-31T10:00:00.000Z");

        expect(sortByRecent([older, oldest, recent])).toEqual([
            recent,
            older,
            oldest,
        ]);
    });

    it("ne modifie pas le tableau reçu", () => {
        const input = [
            action("BOOK_ADDED", null, "2026-06-01T10:00:00.000Z"),
            action("BOOK_ADDED", null, "2026-06-15T10:00:00.000Z"),
        ];
        const snapshot = [...input];

        sortByRecent(input);

        expect(input).toEqual(snapshot);
    });
});
