import { BookReviewVote } from "../../database/entities/book/bookReviewVote";
import { makeUser } from "../../test/factories";
import { makeMyVoteBatch } from "./viewer-review-loaders";

describe("makeMyVoteBatch", () => {
    afterEach(() => jest.restoreAllMocks());

    it("renvoie null partout pour un visiteur, sans requête", async () => {
        const find = jest.spyOn(BookReviewVote, "find");
        const batch = makeMyVoteBatch(async () => null);

        await expect(batch(["r1", "r2"])).resolves.toEqual([null, null]);
        expect(find).not.toHaveBeenCalled();
    });

    it("renvoie le vote de chaque critique dans l'ordre demandé, en une requête", async () => {
        const find = jest.spyOn(BookReviewVote, "find").mockResolvedValue([
            { isHelpful: false, review: { id: "r3" } },
            { isHelpful: true, review: { id: "r1" } },
        ] as BookReviewVote[]);
        const batch = makeMyVoteBatch(async () => makeUser("user-1"));

        await expect(batch(["r1", "r2", "r3"])).resolves.toEqual([
            true,
            null,
            false,
        ]);
        expect(find).toHaveBeenCalledTimes(1);
    });
});
