/**
 * Clique na loja também pelo servidor (API de Conversões da Meta).
 *
 * Todo `store_click` do dataLayer sai com um `event_id` (UUID v4, um por
 * clique). O GTM passa esse id ao Pixel (`eventID`) e, no mesmo clique, este
 * módulo manda o mesmo id para a rota `POST /api/agendabela/web-event`, que
 * repassa ao backend (`POST /tracking/web-events`). Com o mesmo `event_id`
 * nos dois caminhos, a Meta conta o clique uma vez só.
 *
 * Regras:
 *  - Um clique = um `event_id` = um push = um envio. Quem chama é só o
 *    `pushLandingEvent` (dataLayer.ts); nenhum componente chama direto.
 *  - Nunca atrasa nem bloqueia a ida para a loja: `sendBeacon` (ou `fetch`
 *    com `keepalive`), sem esperar resposta, e qualquer falha é silenciosa.
 *  - Sem dado pessoal: nada de e-mail, telefone ou nome. Os cookies `_fbp` e
 *    `_fbc`, o IP e o User-Agent são lidos pela rota, no servidor.
 */

import { detectInAppBrowser } from "@/lib/device";
import type { DeviceOs, InAppBrowser } from "./dataLayer";

export const WEB_EVENT_ENDPOINT = "/api/agendabela/web-event";

/**
 * Parâmetros da URL que seguem no event_source_url. Qualquer outro fica de
 * fora: link de reativação e afins podem levar identificador da conta na
 * query, e isso não vai para a Meta. A rota aplica a mesma lista.
 */
export const SOURCE_URL_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ref",
] as const;

export type StoreClickBeacon = {
  event_id: string;
  store: "app_store" | "google_play";
  cta_location: string;
  device_os: DeviceOs;
  /**
   * Só as landings de loja mandam no evento. Nas outras páginas o envio
   * detecta aqui, pelo User-Agent ("none" quando não é Instagram/Facebook);
   * o push do dataLayer dessas páginas continua sem o parâmetro.
   */
  in_app_browser: InAppBrowser | undefined;
  landing_slug: string;
  /** fbclid da sessão; a rota só usa quando não há cookie `_fbc`. */
  fbclid?: string;
};

/** UUID v4 novo. `crypto.randomUUID` só existe em contexto seguro (https/localhost). */
export function newEventId(): string {
  const c: Crypto | undefined =
    typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function eventSourceUrl(): string {
  const { origin, pathname, search } = window.location;
  const current = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const key of SOURCE_URL_PARAMS) {
    const value = current.get(key);
    if (value) kept.set(key, value);
  }
  const query = kept.toString();
  return query ? `${origin}${pathname}?${query}` : `${origin}${pathname}`;
}

/** Manda o clique para a rota da landing. Nunca lança e nunca espera. */
export function sendStoreClickBeacon(data: StoreClickBeacon): void {
  try {
    const body = JSON.stringify({
      ...data,
      in_app_browser: data.in_app_browser || detectInAppBrowser(),
      event_source_url: eventSourceUrl(),
    });
    // Corpo em texto (text/plain): é o tipo que o sendBeacon aceita em todo
    // navegador, inclusive os internos do Instagram e do Facebook.
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(WEB_EVENT_ENDPOINT, body)
    ) {
      return;
    }
    if (typeof fetch === "function") {
      void fetch(WEB_EVENT_ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        credentials: "same-origin",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
      }).catch(() => {});
    }
  } catch {
    // Medição nunca atrapalha o clique na loja.
  }
}
