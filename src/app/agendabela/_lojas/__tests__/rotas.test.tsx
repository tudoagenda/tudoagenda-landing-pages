import fs from "fs";
import path from "path";
import { render } from "@testing-library/react";
import AppParaSalaoDeBelezaPage from "../../app-para-salao-de-beleza/page";
import BlackFridayPage from "../../black-friday/page";
import OfertaPage from "../../oferta/page";

/**
 * Garantia pedida no plano de medição: as páginas da campanha são
 * separadas no GA4 pelo landing_slug. Este teste monta cada rota inteira
 * (página, config e runtime de verdade) e falha se qualquer evento sair com o
 * slug de outra página, em especial o da landing principal.
 */
const ROTAS = [
  ["app-para-salao-de-beleza", AppParaSalaoDeBelezaPage],
  ["black-friday", BlackFridayPage],
  ["oferta", OfertaPage],
] as const;

const preventNavigation = (event: Event) => {
  if ((event.target as Element).closest("a")) event.preventDefault();
};

beforeEach(() => {
  window.dataLayer = [];
  window.sessionStorage.clear();
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  document.addEventListener("click", preventNavigation, true);
});

afterEach(() => {
  document.removeEventListener("click", preventNavigation, true);
});

describe.each(ROTAS)("rota /agendabela/%s", (slug, Page) => {
  it("todo evento da página sai com o landing_slug da própria rota", () => {
    history.replaceState(null, "", `/agendabela/${slug}`);
    const { container, unmount } = render(<Page />);

    // Todos os links medidos, de todos os aparelhos e do rodapé.
    const links = container.querySelectorAll<HTMLAnchorElement>(
      "a[data-store], a[data-sim], a[data-nav]",
    );
    expect(links.length).toBeGreaterThan(10);
    links.forEach((a) => a.click());

    const eventos = (window.dataLayer ?? []) as Record<string, unknown>[];
    // Decisão de 19/11/2026: nenhuma das rotas cita o preço do Google Play.
    expect(container.innerHTML).not.toContain("59,99");

    expect(eventos).toHaveLength(links.length + 1);
    expect(eventos[0].event).toBe("lp_view");
    expect(new Set(eventos.map((e) => e.landing_slug))).toEqual(new Set([slug]));
    expect(new Set(eventos.map((e) => e.landing_type))).toEqual(
      new Set(["campaign"]),
    );
    unmount();
  });
});

it("o código das landings de loja não usa o push da landing principal", () => {
  const dir = path.join(__dirname, "..");
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(ts|tsx|js)$/.test(file)) continue;
    const source = fs.readFileSync(path.join(dir, file), "utf8");
    expect(source).not.toMatch(
      /pushAgendaBelaMainEvent|automatize-seu-atendimento\/components/,
    );
  }
});
