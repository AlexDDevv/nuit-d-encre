import { Book } from "../../../database/entities/book/book";
import { User } from "../../../database/entities/user/user";
import { UserBook } from "../../../database/entities/user/user-book";
import { grantXpService } from "../../../services/grind/grant-xp-service";
import { checkReadingGoal } from "../../../services/gamification/reading-goal-service";
import { parisToday } from "../../../utils/paris-date";
import {
    makeContext,
    makeUser,
    stubPersistence,
} from "../../../test/factories";
import { ReadingStatus, Roles, UserActionType } from "../../../types/types";
import { UserBooksResolver } from "./user-books-resolver";

jest.mock("../../../services/grind/grant-xp-service");
jest.mock("../../../services/gamification/reading-goal-service");

const grantXp = grantXpService as jest.Mock;
const checkGoal = checkReadingGoal as jest.Mock;

function makeBook(id: string): Book {
    const book = new Book();
    book.id = id;
    book.title = "Le Petit Prince";
    return book;
}

describe("UserBooksResolver", () => {
    const resolver = new UserBooksResolver();
    const user = makeUser("user-1");

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        stubPersistence(UserBook);
    });

    describe("createUserBook", () => {
        it("refuse un livre déjà présent dans la bibliothèque", async () => {
            jest.spyOn(Book, "findOne").mockResolvedValue(makeBook("book-1"));
            jest.spyOn(UserBook, "findOne").mockResolvedValue(new UserBook());

            await expect(
                resolver.createUserBook(
                    { bookId: "book-1" },
                    makeContext(user),
                ),
            ).rejects.toMatchObject({ statusCode: 409 });
            expect(grantXp).not.toHaveBeenCalled();
        });

        it("récompense l'ajout avec une clé liée au livre, pas à l'entrée de bibliothèque", async () => {
            jest.spyOn(Book, "findOne").mockResolvedValue(makeBook("book-1"));
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(new UserBook());

            await resolver.createUserBook(
                { bookId: "book-1", status: ReadingStatus.TO_READ },
                makeContext(user),
            );

            expect(grantXp).toHaveBeenCalledTimes(1);
            expect(grantXp).toHaveBeenCalledWith(
                user,
                UserActionType.BOOK_ADDED_TO_LIBRARY,
                expect.objectContaining({ xpKey: "book:book-1" }),
            );
        });

        it("récompense aussi la lecture terminée quand le livre est ajouté comme lu", async () => {
            jest.spyOn(Book, "findOne").mockResolvedValue(makeBook("book-1"));
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(new UserBook());

            await resolver.createUserBook(
                { bookId: "book-1", status: ReadingStatus.READ },
                makeContext(user),
            );

            expect(grantXp).toHaveBeenCalledWith(
                user,
                UserActionType.BOOK_FINISHED,
                expect.objectContaining({ xpKey: "book:book-1" }),
            );
        });

        it("date du jour un livre ajouté comme lu et vérifie le défi", async () => {
            jest.spyOn(Book, "findOne").mockResolvedValue(makeBook("book-1"));
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(new UserBook());
            const save = jest.spyOn(UserBook.prototype, "save");

            await resolver.createUserBook(
                { bookId: "book-1", status: ReadingStatus.READ },
                makeContext(user),
            );

            expect(save.mock.contexts[0]).toMatchObject({
                finishedAt: parisToday(),
            });
            expect(checkGoal).toHaveBeenCalledWith(user);
        });

        it("garde la date d'une lecture ancienne fournie à l'ajout", async () => {
            jest.spyOn(Book, "findOne").mockResolvedValue(makeBook("book-1"));
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(new UserBook());
            const save = jest.spyOn(UserBook.prototype, "save");

            await resolver.createUserBook(
                {
                    bookId: "book-1",
                    status: ReadingStatus.READ,
                    finishedAt: "2019-05-02",
                },
                makeContext(user),
            );

            expect(save.mock.contexts[0]).toMatchObject({
                finishedAt: "2019-05-02",
            });
        });
    });

    describe("updateUserBook", () => {
        function existingUserBook(status: ReadingStatus): UserBook {
            const userBook = new UserBook();
            userBook.id = "ub-1";
            userBook.status = status;
            userBook.user = user;
            userBook.book = makeBook("book-1");
            return userBook;
        }

        it("récompense le passage à « lu » avec une clé liée au livre", async () => {
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(existingUserBook(ReadingStatus.READING))
                .mockResolvedValueOnce(new UserBook());

            await resolver.updateUserBook(
                { id: "ub-1", status: ReadingStatus.READ },
                makeContext(user),
            );

            expect(grantXp).toHaveBeenCalledWith(
                user,
                UserActionType.BOOK_FINISHED,
                expect.objectContaining({ xpKey: "book:book-1" }),
            );
        });

        it("ne récompense rien si le livre était déjà lu", async () => {
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(existingUserBook(ReadingStatus.READ))
                .mockResolvedValueOnce(new UserBook());

            await resolver.updateUserBook(
                { id: "ub-1", status: ReadingStatus.READ },
                makeContext(user),
            );

            expect(grantXp).not.toHaveBeenCalled();
        });

        it("date du jour la lecture terminée dans l'app et vérifie le défi", async () => {
            const userBook = existingUserBook(ReadingStatus.READING);
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(userBook)
                .mockResolvedValueOnce(new UserBook());

            await resolver.updateUserBook(
                { id: "ub-1", status: ReadingStatus.READ },
                makeContext(user),
            );

            expect(userBook.finishedAt).toBe(parisToday());
            expect(checkGoal).toHaveBeenCalledWith(user);
        });

        it("garde la date « Lu le » fournie", async () => {
            const userBook = existingUserBook(ReadingStatus.READING);
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(userBook)
                .mockResolvedValueOnce(new UserBook());

            await resolver.updateUserBook(
                {
                    id: "ub-1",
                    status: ReadingStatus.READ,
                    finishedAt: "2025-06-01",
                },
                makeContext(user),
            );

            expect(userBook.finishedAt).toBe("2025-06-01");
        });

        it("refuse une date de fin dans le futur", async () => {
            const findOne = jest.spyOn(UserBook, "findOne");

            await expect(
                resolver.updateUserBook(
                    { id: "ub-1", finishedAt: "2999-01-01" },
                    makeContext(user),
                ),
            ).rejects.toMatchObject({ statusCode: 400 });
            expect(findOne).not.toHaveBeenCalled();
        });

        it("n'accorde rien et ne journalise rien quand le livre est abandonné", async () => {
            jest.spyOn(UserBook, "findOne")
                .mockResolvedValueOnce(existingUserBook(ReadingStatus.READING))
                .mockResolvedValueOnce(new UserBook());

            await resolver.updateUserBook(
                { id: "ub-1", status: ReadingStatus.ABANDONED },
                makeContext(user),
            );

            expect(grantXp).not.toHaveBeenCalled();
        });

        it("ne cherche que dans la bibliothèque de l'utilisateur connecté", async () => {
            const findOne = jest
                .spyOn(UserBook, "findOne")
                .mockResolvedValue(null);

            await expect(
                resolver.updateUserBook({ id: "ub-other" }, makeContext(user)),
            ).rejects.toMatchObject({ statusCode: 404 });
            expect(findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "ub-other", user: { id: "user-1" } },
                }),
            );
        });
    });

    describe("bibliothèque d'un autre utilisateur", () => {
        const owner = (isLibraryPublic: boolean) =>
            Object.assign(new User(), { id: "owner", isLibraryPublic });

        it("refuse une bibliothèque privée avant toute lecture", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(owner(false));
            const query = jest.spyOn(UserBook, "createQueryBuilder");

            await expect(
                resolver.userBooks({}, makeContext(user), "owner"),
            ).rejects.toMatchObject({ statusCode: 403 });
            await expect(
                resolver.userBookStatusCounts(makeContext(user), "owner"),
            ).rejects.toMatchObject({ statusCode: 403 });
            expect(query).not.toHaveBeenCalled();
        });

        it("renvoie NOT_FOUND pour un utilisateur inconnu", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(null);

            await expect(
                resolver.userBookStatusCounts(makeContext(user), "ghost"),
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it("ouvre une bibliothèque privée à l'admin", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(owner(false));
            const getRawMany = jest.fn().mockResolvedValue([]);
            const qb: Record<string, jest.Mock> = { getRawMany };
            for (const method of ["select", "addSelect", "where", "groupBy"]) {
                qb[method] = jest.fn(() => qb);
            }
            jest.spyOn(UserBook, "createQueryBuilder").mockReturnValue(
                qb as never,
            );

            await resolver.userBookStatusCounts(
                makeContext(makeUser("admin", Roles.Admin)),
                "owner",
            );
            expect(qb.where).toHaveBeenCalledWith("ub.userId = :userId", {
                userId: "owner",
            });
        });
    });
});
