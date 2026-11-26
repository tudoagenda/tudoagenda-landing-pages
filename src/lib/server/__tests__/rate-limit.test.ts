/**
 * @jest-environment node
 */

import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
  it("deixa passar até o limite por chave e volta na janela seguinte", () => {
    const l = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([1, 2, 3, 4, 5].map(() => l.allow("a", 0))).toEqual([true, true, true, false, false]);
    expect(l.allow("b", 0)).toBe(true);
    expect(l.allow("a", 999)).toBe(false);
    expect(l.allow("a", 1000)).toBe(true);
  });

  it("janelas vencidas são varridas: a memória não cresce com chaves antigas", () => {
    const l = createRateLimiter({ limit: 3, windowMs: 1000 });
    for (let i = 0; i < 500; i += 1) l.allow(`ip-${i}`, 0);
    expect(l.size()).toBe(500);
    l.allow("novo", 2000);
    expect(l.size()).toBe(1);
  });

  it("nunca passa do teto de chaves, mesmo com todas na mesma janela", () => {
    const l = createRateLimiter({ limit: 3, windowMs: 60_000, maxKeys: 100 });
    for (let i = 0; i < 1000; i += 1) {
      l.allow(`ip-${i}`, 0);
      expect(l.size()).toBeLessThanOrEqual(100);
    }
  });
});
