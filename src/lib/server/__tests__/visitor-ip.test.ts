/**
 * @jest-environment node
 */

import { parseAwsRanges } from "../client-ip";
import { parseViewerAddress, resolveVisitorIp, rightmostVisitorIp } from "../visitor-ip";

const h = (init: Record<string, string>) => new Headers(init);
const AWS = parseAwsRanges({
  prefixes: [{ ip_prefix: "130.176.0.0/16", service: "CLOUDFRONT" }, { ip_prefix: "3.80.0.0/12", service: "EC2" }],
  ipv6_prefixes: [{ ipv6_prefix: "2600:9000::/28", service: "CLOUDFRONT" }],
});
const faixas = async () => AWS;
const semFaixas = async () => null;

describe("parseAwsRanges", () => {
  it("lê as faixas de qualquer serviço, v4 e v6, e ignora entrada quebrada", () => {
    expect(AWS).toHaveLength(3);
    expect(parseAwsRanges({ prefixes: [{ ip_prefix: "lixo" }, {}] })).toEqual([]);
    expect(parseAwsRanges(null)).toEqual([]);
  });
});

describe("parseViewerAddress", () => {
  it.each([
    ["198.51.100.10:46532", "198.51.100.10"],
    ["2804:14c:1::abcd:46532", "2804:14c:1::abcd"],
    ["[2804:14c:1::abcd]:46532", "2804:14c:1::abcd"],
  ])("%s → %s", (valor, ip) => expect(parseViewerAddress(valor)).toBe(ip));
  it.each(["", "198.51.100.10", "10.0.0.1:443", "lixo:1", ":443"])("%s → null", (valor) =>
    expect(parseViewerAddress(valor)).toBeNull(),
  );
});

describe("rightmostVisitorIp", () => {
  it.each([
    [["198.51.100.10"], "198.51.100.10"],
    [["6.6.6.6", "198.51.100.10"], "198.51.100.10"],
    [["198.51.100.10", "130.176.1.1"], "198.51.100.10"],
    [["198.51.100.10", "130.176.1.1", "10.0.0.1", "3.85.0.1"], "198.51.100.10"],
    [["2804:14c::1", "2600:9000::5"], "2804:14c::1"],
    [["130.176.1.1"], null],
    [["198.51.100.10", "lixo"], null],
    [[], null],
  ])("%j → %s", (xff, esperado) => expect(rightmostVisitorIp(xff, AWS)).toBe(esperado));
});

describe("resolveVisitorIp", () => {
  it("pedido direto (sem CloudFront): o mesmo de resolveClientIp, sem ler faixas", async () => {
    const carregar = jest.fn(faixas);
    expect(await resolveVisitorIp(h({ "x-real-ip": "198.51.100.10" }), carregar)).toEqual({
      ip: "198.51.100.10",
      source: "resolved",
    });
    expect(carregar).not.toHaveBeenCalled();
  });

  it("CloudFront-Viewer-Address vem antes do X-Forwarded-For", async () => {
    expect(
      await resolveVisitorIp(
        h({ "x-amz-cf-id": "a", "cloudfront-viewer-address": "198.51.100.10:1", "x-forwarded-for": "6.6.6.6" }),
        faixas,
      ),
    ).toEqual({ ip: "198.51.100.10", source: "cf_viewer_address" });
  });

  it("cadeia do Railway: penúltima quando a última é o X-Real-IP", async () => {
    expect(
      await resolveVisitorIp(
        h({ "x-amz-cf-id": "a", "x-forwarded-for": "198.51.100.10, 130.176.1.1", "x-real-ip": "130.176.1.1" }),
        semFaixas,
      ),
    ).toEqual({ ip: "198.51.100.10", source: "cf_penultimate" });
  });

  it("CloudFront sem X-Real-IP: X-Forwarded-For da direita para a esquerda", async () => {
    const headers = h({ "x-amz-cf-id": "a", "x-forwarded-for": "6.6.6.6, 198.51.100.10, 130.176.1.1" });
    expect(await resolveVisitorIp(headers, faixas)).toEqual({ ip: "198.51.100.10", source: "xff_rightmost" });
    expect(await resolveVisitorIp(headers, semFaixas)).toEqual({ ip: null, source: "none" });
  });

  it("IP privado em qualquer fonte: sem IP", async () => {
    expect(await resolveVisitorIp(h({ "x-real-ip": "10.0.0.1" }), faixas)).toEqual({ ip: null, source: "none" });
    expect(await resolveVisitorIp(h({ "x-amz-cf-id": "a", "x-forwarded-for": "192.168.0.2" }), faixas)).toEqual({
      ip: null,
      source: "none",
    });
  });

  it("sem cabeçalho nenhum: sem IP", async () => {
    expect(await resolveVisitorIp(h({}), faixas)).toEqual({ ip: null, source: "none" });
  });
});
