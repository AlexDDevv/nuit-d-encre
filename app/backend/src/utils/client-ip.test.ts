import { IncomingMessage } from "http";
import { getClientIp } from "./client-ip";

const makeReq = (
    headers: Record<string, string | string[]>,
    remoteAddress?: string,
): IncomingMessage =>
    ({ headers, socket: { remoteAddress } }) as unknown as IncomingMessage;

describe("getClientIp", () => {
    it("utilise X-Real-IP posé par le proxy", () => {
        expect(getClientIp(makeReq({ "x-real-ip": "203.0.113.7" }))).toBe(
            "203.0.113.7",
        );
    });

    it("ignore X-Forwarded-For, falsifiable par le client", () => {
        const req = makeReq(
            { "x-forwarded-for": "1.2.3.4, 203.0.113.7" },
            "10.0.0.5",
        );
        expect(getClientIp(req)).toBe("10.0.0.5");
    });

    it("retombe sur l'adresse de la socket sans en-tête", () => {
        expect(getClientIp(makeReq({}, "172.18.0.3"))).toBe("172.18.0.3");
    });

    it("renvoie unknown sans aucune information", () => {
        expect(getClientIp(makeReq({}))).toBe("unknown");
    });
});
