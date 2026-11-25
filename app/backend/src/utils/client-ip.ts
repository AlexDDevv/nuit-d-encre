import { IncomingMessage } from "http";

/**
 * IP du client, utilisée comme clé de rate limiting.
 *
 * Seul `X-Real-IP` est lu : le nginx du front le réécrit avec l'IP réelle
 * (module realip, cf. `app/frontend/nginx/default.conf.template`) et le back
 * n'est joignable que par lui en prod. `X-Forwarded-For` n'est jamais lu : sa
 * première valeur est fournie par le client, qui pourrait changer d'IP à
 * chaque requête et contourner le rate limiting.
 *
 * Sans en-tête (dev via le proxy Vite), repli sur l'adresse de la socket.
 */
export function getClientIp(req: IncomingMessage): string {
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim().length > 0) {
        return realIp.trim();
    }
    return req.socket?.remoteAddress ?? "unknown";
}
