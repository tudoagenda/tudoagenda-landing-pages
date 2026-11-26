/**
 * Links de loja da reativação: cada clique sai como store_click, com os nomes
 * de parâmetro que as tags do GTM leem (store, cta_location, device_os).
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ReactivationFlow } from "../reactivation-flow";
import { reactivationService } from "@/services/reactivation";
import { APP_STORE_URL, GOOGLE_PLAY_BASE_URL } from "@/config/app-stores";
import { MAIN_RESET_KEYS } from "@/lib/analytics/dataLayer";

jest.mock("@/services/reactivation", () => ({
  reactivationService: {
    lookup: jest.fn(),
    start: jest.fn(),
  },
}));

const mockLookup = reactivationService.lookup as jest.Mock;

const UA_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
}

function renderFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReactivationFlow />
    </QueryClientProvider>,
  );
}

const eventos = () => window.dataLayer as Record<string, unknown>[];

/** jsdom não navega: o clique num link só dispara os listeners. */
function preventNavigation(event: Event) {
  if ((event.target as Element).closest("a")) event.preventDefault();
}

async function abrirJaAssinante() {
  mockLookup.mockResolvedValue({ status: "ALREADY_ACTIVE" });
  renderFlow();
  fireEvent.change(screen.getByLabelText(/Email ou WhatsApp/i), {
    target: { value: "ativa@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
  await screen.findByText(/Sua conta já está ativa\./i);
}

async function abrirConcluida(url = "/agendabela/reativar?reactivation=success") {
  history.replaceState(null, "", url);
  renderFlow();
  await screen.findByText(/Cartão confirmado/i);
}

beforeEach(() => {
  jest.clearAllMocks();
  window.sessionStorage.clear();
  window.dataLayer = [];
  history.replaceState(null, "", "/agendabela/reativar");
  setUserAgent(UA_IPHONE);
  document.addEventListener("click", preventNavigation, true);
});

afterEach(() => {
  document.removeEventListener("click", preventNavigation, true);
});

describe("reativação: store_click nos links de loja", () => {
  it.each([
    [/App Store \(iOS\)/i, "app_store"],
    [/Google Play \(Android\)/i, "google_play"],
  ])("reativação concluída: %s envia store_click", async (nome, store) => {
    await abrirConcluida();
    fireEvent.click(screen.getByRole("link", { name: nome }));
    expect(eventos()).toHaveLength(1);
    expect(eventos()[0]).toMatchObject({
      event: "store_click",
      store,
      cta_location: "reativacao_concluida_baixar_app",
      device_os: "ios",
      product: "agendabela",
      landing_type: "campaign",
      landing_slug: "reativacao",
    });
  });

  it.each([
    [/Baixar app \(iOS\)/i, "app_store"],
    [/Baixar app \(Android\)/i, "google_play"],
  ])("já assinante: %s envia store_click", async (nome, store) => {
    setUserAgent(UA_ANDROID);
    await abrirJaAssinante();
    fireEvent.click(screen.getByRole("link", { name: nome }));
    expect(eventos()).toHaveLength(1);
    expect(eventos()[0]).toMatchObject({
      event: "store_click",
      store,
      cta_location: "ja_assinante_baixar_app",
      device_os: "android",
      landing_slug: "reativacao",
    });
  });

  it("o evento só leva os parâmetros conhecidos: nada do que a pessoa digitou", async () => {
    await abrirJaAssinante();
    fireEvent.click(screen.getByRole("link", { name: /Baixar app \(iOS\)/i }));
    expect(Object.keys(eventos()[0]).sort()).toEqual(
      [
        "event",
        "product",
        "landing_type",
        "landing_slug",
        ...MAIN_RESET_KEYS,
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "gclid",
        "fbclid",
      ].sort(),
    );
    expect(JSON.stringify(eventos())).not.toContain("ativa@example.com");
  });

  it("os links continuam os mesmos, em aba nova", async () => {
    await abrirConcluida();
    const ios = screen.getByRole("link", { name: /App Store \(iOS\)/i });
    const android = screen.getByRole("link", { name: /Google Play \(Android\)/i });
    expect(ios).toHaveAttribute("href", APP_STORE_URL);
    // Sem origem na sessão, o link da Play sai puro.
    expect(android).toHaveAttribute("href", GOOGLE_PLAY_BASE_URL);
    for (const a of [ios, android]) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("link da Google Play leva a origem da sessão no referrer", async () => {
    await abrirConcluida(
      "/agendabela/reativar?reactivation=success&utm_source=whatsapp&utm_campaign=reativacao_nov26",
    );
    const android = screen.getByRole("link", { name: /Google Play \(Android\)/i });
    const referrer = new URLSearchParams(
      new URL(android.getAttribute("href") ?? "").searchParams.get("referrer") ?? "",
    );
    expect(Object.fromEntries(referrer)).toEqual({
      utm_source: "whatsapp",
      utm_campaign: "reativacao_nov26",
    });
    // O link da App Store não muda com a origem.
    expect(screen.getByRole("link", { name: /App Store \(iOS\)/i })).toHaveAttribute(
      "href",
      APP_STORE_URL,
    );
  });
});

describe("reativação: lista de reset não muda os eventos que já existiam", () => {
  it("paywall_viewed segue com flow e landing_slug, e não herda nada", async () => {
    mockLookup.mockResolvedValue({
      status: "PENDING_CHECKOUT_FOUND",
      salonName: "Salão Teste",
      maskedEmail: "t***@example.com",
      checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
    });
    renderFlow();
    fireEvent.change(screen.getByLabelText(/Email ou WhatsApp/i), {
      target: { value: "teste@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    await screen.findByText("Salão Teste");
    expect(eventos()).toHaveLength(1);
    const { event, flow, landing_slug, landing_type, product, ...resto } =
      eventos()[0];
    expect({ event, flow, landing_slug, landing_type, product }).toEqual({
      event: "paywall_viewed",
      flow: "reactivation",
      landing_slug: "reativacao",
      landing_type: "campaign",
      product: "agendabela",
    });
    // Todo o resto é chave zerada (undefined explícito), sem valor.
    expect(Object.values(resto).every((v) => v === undefined)).toBe(true);
  });

  it("depois de um store_click, o evento seguinte não herda store nem cta_location", async () => {
    await abrirJaAssinante();
    fireEvent.click(screen.getByRole("link", { name: /Baixar app \(iOS\)/i }));
    // Próximo push da mesma página (qualquer evento da reativação).
    const { pushAgendaBelaReativacaoEvent } = jest.requireActual(
      "@/lib/analytics/dataLayer",
    );
    pushAgendaBelaReativacaoEvent({
      event: "checkout_opened",
      flow: "reactivation",
      source: "lp_reactivation",
    });
    const seguinte = eventos()[1];
    expect(seguinte).toMatchObject({
      event: "checkout_opened",
      flow: "reactivation",
      source: "lp_reactivation",
      landing_slug: "reativacao",
    });
    for (const key of ["store", "cta_location", "device_os"]) {
      expect(key in seguinte).toBe(true);
      expect(seguinte[key]).toBeUndefined();
    }
  });
});

describe("reativação: store_click também vai ao servidor (API de Conversões)", () => {
  const sendBeacon = jest.fn(() => true);

  beforeEach(() => {
    sendBeacon.mockClear();
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
  });
  afterEach(() => {
    // @ts-expect-error o jsdom não tem sendBeacon; devolve o navigator como estava
    delete navigator.sendBeacon;
  });

  it.each([
    ["reativação concluída", abrirConcluida, /App Store \(iOS\)/i, "reativacao_concluida_baixar_app"],
    ["já assinante", abrirJaAssinante, /Baixar app \(iOS\)/i, "ja_assinante_baixar_app"],
  ])("%s: um clique = um push com event_id = um envio com os mesmos dados", async (_nome, abrir, link, local) => {
    await abrir();
    fireEvent.click(screen.getByRole("link", { name: link }));

    expect(eventos()).toHaveLength(1);
    const push = eventos()[0];
    expect(push.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(push.in_app_browser).toBe("none");
    expect(push.cta_location).toBe(local);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, corpo] = sendBeacon.mock.calls[0] as unknown as [string, string];
    expect(url).toBe("/api/agendabela/web-event");
    expect(JSON.parse(corpo)).toEqual({
      event_id: push.event_id,
      store: push.store,
      cta_location: push.cta_location,
      device_os: push.device_os,
      in_app_browser: push.in_app_browser,
      landing_slug: "reativacao",
      // Sem a query da reativação (?reactivation=...): só a origem da visita segue.
      event_source_url: "http://localhost/agendabela/reativar",
    });
  });

  it("dois cliques: ids diferentes e dois envios; event_id e in_app_browser estão na lista de reset", async () => {
    await abrirJaAssinante();
    fireEvent.click(screen.getByRole("link", { name: /Baixar app \(iOS\)/i }));
    fireEvent.click(screen.getByRole("link", { name: /Baixar app \(Android\)/i }));
    const [a, b] = eventos();
    expect(a.event_id).not.toBe(b.event_id);
    expect(MAIN_RESET_KEYS).toEqual(expect.arrayContaining(["event_id", "in_app_browser"]));
    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });
});
