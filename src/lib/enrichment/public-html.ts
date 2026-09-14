import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const blocked = new BlockList();
for (const [ip, bits] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 4], ["240.0.0.0", 4]] as const) blocked.addSubnet(ip, bits);
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
blocked.addSubnet("2001::", 23, "ipv6");
blocked.addSubnet("2001:db8::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return family === 6 && globalV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

/** Validate every redirect and pin the resolved address to prevent DNS rebinding. */
export async function fetchPublicHtml(raw: string, timeoutMs = 5000, maxBytes = 500_000): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;
  async function visit(rawUrl: string, redirects: number): Promise<string | null> {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || redirects > 3) return null;
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await lookup(hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address)) || Date.now() >= deadline) return null;
    const pinned = addresses[0];
    return new Promise<string | null>((resolve) => {
      const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
        family: pinned.family,
        lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HellensBot/1.0)", "Accept-Encoding": "identity" },
      });
      const timer = setTimeout(() => { request.destroy(); resolve(null); }, Math.max(1, deadline - Date.now()));
      request.on("error", () => { clearTimeout(timer); resolve(null); });
      request.on("response", (response) => {
        const status = response.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
          response.destroy(); clearTimeout(timer);
          resolve(visit(new URL(response.headers.location, url).href, redirects + 1).catch(() => null));
          return;
        }
        if (status < 200 || status >= 300 || !String(response.headers["content-type"]).toLowerCase().startsWith("text/")) {
          response.destroy(); clearTimeout(timer); resolve(null); return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          const part = chunk.subarray(0, maxBytes - size);
          chunks.push(part); size += part.length;
          if (size >= maxBytes) { clearTimeout(timer); resolve(Buffer.concat(chunks).toString("utf8")); response.destroy(); }
        });
        response.on("end", () => { clearTimeout(timer); resolve(Buffer.concat(chunks).toString("utf8")); });
        response.on("error", () => { clearTimeout(timer); resolve(null); });
      });
      request.end();
    });
  }
  // Also bound DNS resolution; a late DNS response cannot open a connection.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([visit(raw, 0), new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); })]);
  } catch { return null; }
  finally { clearTimeout(timer); }
}
