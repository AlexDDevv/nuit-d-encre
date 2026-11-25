import "reflect-metadata";
import { IsUrl, validate } from "class-validator";
import {
    EXTERNAL_URL_OPTIONS,
    isInternalPath,
    SkipIfEmpty,
} from "./validation";

class Sample {
    @SkipIfEmpty()
    @IsUrl(EXTERNAL_URL_OPTIONS)
    url?: string;
}

const check = (url?: string) =>
    validate(Object.assign(new Sample(), { url })).then((e) => e.length);

describe("SkipIfEmpty + EXTERNAL_URL_OPTIONS", () => {
    it("ignore un champ vide ou absent", async () => {
        expect(await check(undefined)).toBe(0);
        expect(await check("")).toBe(0);
    });

    it("accepte une URL http(s) complète", async () => {
        expect(await check("https://fr.wikipedia.org/wiki/Victor_Hugo")).toBe(
            0,
        );
    });

    it.each([
        "javascript:alert(1)",
        "data:text/html,<script>",
        "fr.wikipedia.org/wiki/Hugo",
        "ftp://example.com",
    ])("refuse %s", async (url) => {
        expect(await check(url)).toBe(1);
    });
});

describe("isInternalPath", () => {
    it.each([
        ["/books", true],
        ["/", true],
        ["//evil.example", false],
        ["/\\evil.example", false],
        ["https://example.com", false],
    ])("%s → %s", (value, expected) => {
        expect(isInternalPath(value)).toBe(expected);
    });
});
