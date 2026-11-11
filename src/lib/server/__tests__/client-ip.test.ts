/**
 * @jest-environment node
 */

import {
  ipInCidrs,
  logClientIpDiagnostics,
  parseCloudFrontRanges,
  resolveClientIp,
} from "../client-ip";
import { buildLandingHeaders } from "../landing-backend";

const h = (init: Record<string, string>) => new Headers(init);

describe("resolveClientIp", () => {
  it("CloudFront → Railway: penúltima entrada do XFF (a última é o nó do CloudFront)", () => {
    const r = resolveClientIp(
      h({
        "x-amz-cf-id": "abc",
        "x-forwarded-for": "6.6.6.6, 203.0.113.7, 130.176.1.1",
        "x-real-ip": "130.176.1.1",
      }),
    );
    expect(r).toEqual(expect.objectContaining({ ip: "203.0.113.7", source: "cf_penultimate", viaCloudFront: true }));
  });

  it("detecta o CloudFront também pelo via", () => {
    const r = resolveClientIp(
      h({
        via: "2.0 abc.cloudfront.net (CloudFront)",
        "x-forwarded-for": "203.0.113.7, 130.176.1.1",
      }),
    );
    expect(r.source).toBe("cf_penultimate");
    expect(r.ip).toBe("203.0.113.7");
  });

  it("CloudFront com formato inesperado (última ≠ X-Real-IP): indeterminado", () => {
    const r = resolveClientIp(
      h({ "x-amz-cf-id": "abc", "x-forwarded-for": "6.6.6.6, 203.0.113.7", "x-real-ip": "130.176.1.1" }),
    );
    expect(r).toEqual(expect.objectContaining({ ip: null, source: "none" }));
  });

  it("CloudFront com uma entrada só: indeterminado", () => {
    expect(resolveClientIp(h({ "x-amz-cf-id": "a", "x-forwarded-for": "130.176.1.1" })).source).toBe("none");
  });

  it("CloudFront com penúltima inválida: indeterminado", () => {
    expect(
      resolveClientIp(h({ "x-amz-cf-id": "a", "x-forwarded-for": "lixo, 130.176.1.1" })).source,
    ).toBe("none");
  });

  it("sem CloudFront: X-Real-IP do Railway", () => {
    const r = resolveClientIp(h({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "6.6.6.6, 203.0.113.7" }));
    expect(r).toEqual(expect.objectContaining({ ip: "203.0.113.7", source: "real_ip", viaCloudFront: false }));
  });

  it("sem CloudFront e sem X-Real-IP: última do XFF", () => {
    const r = resolveClientIp(h({ "x-forwarded-for": "6.6.6.6, 2001:db8::1" }));
    expect(r).toEqual(expect.objectContaining({ ip: "2001:db8::1", source: "xff_last" }));
  });

  it("nada válido: none", () => {
    expect(resolveClientIp(h({ "x-forwarded-for": "lixo" })).source).toBe("none");
  });
});

describe("buildLandingHeaders", () => {
  const ENV = { ...process.env };
  afterEach(() => {
    process.env = { ...ENV };
    jest.restoreAllMocks();
  });

  it("nunca manda a chave sem IP", () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    jest.spyOn(console, "info").mockImplementation(() => {});
    const req = new Request("http://x", {
      headers: { "x-amz-cf-id": "a", "x-forwarded-for": "130.176.1.1" },
    });
    const headers = buildLandingHeaders(req, "signup-web");
    expect(headers["X-Landing-Key"]).toBeUndefined();
    expect(headers["X-Client-IP"]).toBeUndefined();
  });

  it("log de diagnóstico tem a fonte e nunca o IP", () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const req = new Request("http://x", {
      headers: { "x-amz-cf-id": "a", "x-forwarded-for": "203.0.113.7, 130.176.1.1" },
    });
    buildLandingHeaders(req, "signup-web");
    const line = info.mock.calls.map((c) => String(c[0])).find((l) => l.includes("landing_client_ip"))!;
    expect(JSON.parse(line)).toEqual(
      expect.objectContaining({ source: "cf_penultimate", route: "signup-web", via_cloudfront: true }),
    );
    expect(line).not.toContain("203.0.113.7");
    expect(line).not.toContain("130.176.1.1");
  });

  it("em produção, diz se o último salto está nas faixas do CloudFront (sem IP no log)", async () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          prefixes: [{ ip_prefix: "130.176.0.0/17", service: "CLOUDFRONT" }],
          ipv6_prefixes: [],
        }),
        { status: 200 },
      ),
    );
    (process.env as Record<string, string>).NODE_ENV = "production";
    logClientIpDiagnostics(
      { ip: "203.0.113.7", source: "cf_penultimate", lastHop: "130.176.1.1", viaCloudFront: true },
      "start-trial",
    );
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const line = info.mock.calls.map((c) => String(c[0])).find((l) => l.includes("start-trial"))!;
    expect(JSON.parse(line).last_hop_in_cloudfront_ranges).toBe(true);
    expect(line).not.toContain("130.176.1.1");
  });
});

describe("faixas do CloudFront", () => {
  const cidrs = parseCloudFrontRanges({
    prefixes: [
      { ip_prefix: "130.176.0.0/17", service: "CLOUDFRONT" },
      { ip_prefix: "3.0.0.0/8", service: "EC2" },
    ],
    ipv6_prefixes: [{ ipv6_prefix: "2600:9000:2000::/36", service: "CLOUDFRONT" }],
  });

  it("só pega service CLOUDFRONT", () => {
    expect(cidrs).toHaveLength(2);
    expect(ipInCidrs("3.1.1.1", cidrs)).toBe(false);
  });

  it("IPv4 e IPv6", () => {
    expect(ipInCidrs("130.176.1.1", cidrs)).toBe(true);
    expect(ipInCidrs("130.177.0.1", cidrs)).toBe(false);
    expect(ipInCidrs("2600:9000:2001::5", cidrs)).toBe(true);
    expect(ipInCidrs("2600:9001::5", cidrs)).toBe(false);
  });
});
