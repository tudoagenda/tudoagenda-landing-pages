/**
 * Limite de pedidos em memória, por chave (ex.: IP), em janela fixa.
 *
 * Vale por instância do servidor e some no deploy: é um freio barato para uma
 * pessoa em laço, não uma proteção contra ataque distribuído. Sem dependência.
 */

type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  /** Conta o pedido e diz se ele cabe no limite da chave. */
  allow: (key: string, now?: number) => boolean;
  /** Chaves em memória (para teste). */
  size: () => number;
  reset: () => void;
};

export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  /** Teto de chaves guardadas; acima dele as janelas vencidas são varridas. */
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs } = opts;
  const maxKeys = opts.maxKeys ?? 5000;
  const buckets = new Map<string, Bucket>();
  let nextSweepAt = 0;

  function sweep(now: number): void {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    // Ainda cheio só com janelas vivas (muitas chaves no mesmo minuto):
    // esvazia tudo em vez de crescer sem fim.
    if (buckets.size >= maxKeys) buckets.clear();
    nextSweepAt = now + windowMs;
  }

  return {
    allow(key, now = Date.now()) {
      if (now >= nextSweepAt || buckets.size >= maxKeys) sweep(now);
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      bucket.count += 1;
      return bucket.count <= limit;
    },
    size: () => buckets.size,
    reset() {
      buckets.clear();
      nextSweepAt = 0;
    },
  };
}

/**
 * Rota POST /api/agendabela/web-event: 20 cliques por minuto por IP. O backend
 * aceita 60/min somando todas as visitantes; sem este freio, uma pessoa em
 * laço gastaria esse limite sozinha. Pedidos sem IP confiável dividem uma
 * chave só.
 */
export const webEventRateLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });
