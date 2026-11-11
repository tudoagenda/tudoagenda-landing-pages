import { act, fireEvent, render, screen } from "@testing-library/react";
import { HeroComponent } from "../hero";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";

const queryClient = new QueryClient();

describe("HeroComponent", () => {
  it("should render the HeroComponent", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <HeroComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    expect(
      screen.getByText("A Bela cuida da sua agenda enquanto você atende.")
    ).toBeInTheDocument();
  });

  it("link de texto para o simulador fica só no desktop, na mesma aba", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <HeroComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    const link = screen.getByRole("link", {
      name: "Prefere ver antes? Teste o app sem cadastro →",
    });
    expect(link).toHaveAttribute("href", "/agendabela/experimente?ref=automatize_hero");
    expect(link).not.toHaveAttribute("target");
    expect(link.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(link.className).toMatch(/md:inline-flex/);
  });

  it("card fixo do celular some quando o rodapé ou a seção do simulador entram na tela", () => {
    type Entry = { isIntersecting: boolean; target: Element };
    let notify: (entries: Entry[]) => void = () => {};
    const observed: Element[] = [];
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(cb: typeof notify) {
        notify = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      disconnect() {}
    } as unknown as typeof IntersectionObserver;

    const footer = document.createElement("footer");
    footer.id = "rodape";
    const section = document.createElement("section");
    section.id = "teste-sem-cadastro";
    document.body.append(section, footer);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <HeroComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    const card = container.querySelector<HTMLElement>("div.fixed")!;
    expect(observed).toEqual(expect.arrayContaining([footer, section]));
    expect(card).not.toHaveAttribute("aria-hidden");

    // seção do simulador na tela (em 320px o card cobria o botão)
    act(() => notify([{ isIntersecting: true, target: section }]));
    expect(card).toHaveAttribute("aria-hidden", "true");
    expect(card.hasAttribute("inert")).toBe(true);
    expect(card.className).toMatch(/opacity-0/);
    act(() => notify([{ isIntersecting: false, target: section }]));
    expect(card).not.toHaveAttribute("aria-hidden");

    // rodapé na tela
    act(() => notify([{ isIntersecting: true, target: footer }]));
    expect(card).toHaveAttribute("aria-hidden", "true");
    // seção sai, rodapé continua: segue escondido
    act(() => notify([{ isIntersecting: false, target: section }]));
    expect(card).toHaveAttribute("aria-hidden", "true");
    act(() => notify([{ isIntersecting: false, target: footer }]));
    expect(card).not.toHaveAttribute("aria-hidden");

    // foco no botão do card: a zona aparece, mas o card não some
    const input = card.querySelector("button")!;
    act(() => input.focus());
    act(() => notify([{ isIntersecting: true, target: section }]));
    expect(card).not.toHaveAttribute("aria-hidden");
    act(() => input.blur());
    expect(card).toHaveAttribute("aria-hidden", "true");

    footer.remove();
    section.remove();
    window.IntersectionObserver = original;
  });

  it("um botão só abre o cadastro (sem campo de e-mail na página)", async () => {
    window.dataLayer = [];
    sessionStorage.clear();
    render(<HeroComponent />);
    expect(screen.queryByPlaceholderText("Seu melhor email")).not.toBeInTheDocument();
    const [desktop] = screen.getAllByRole("button", { name: "Começar meus 7 dias grátis" });
    fireEvent.click(desktop);
    expect(await screen.findByText("Crie sua conta")).toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "lp_cta_clicked", cta_position: "hero" }),
    );
  });

  it("conta já criada nesta aba: o botão volta para a Escolha", async () => {
    sessionStorage.setItem(
      "agendabela_signup_web",
      JSON.stringify({ profileId: "p", email: "a@b.co", firstName: "Ana", accessLinkSent: true }),
    );
    render(<HeroComponent />);
    fireEvent.click(screen.getAllByRole("button", { name: "Começar meus 7 dias grátis" })[0]);
    expect(await screen.findByText("Como você quer começar seus 7 dias?")).toBeInTheDocument();
    sessionStorage.clear();
  });

  it("volta do checkout concluído sem contexto abre a tela genérica do app", async () => {
    window.dataLayer = [];
    sessionStorage.clear();
    history.replaceState(null, "", "/agendabela/automatize-seu-atendimento?checkout=concluido");
    render(<HeroComponent />);
    expect(await screen.findByText("Pronto! Agora é no app.")).toBeInTheDocument();
    expect(window.location.search).toBe("");
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "checkout_returned", checkout_result: "concluido" }),
    );
  });

  it("volta do checkout (voltou) sem contexto: landing normal, sem modal", () => {
    sessionStorage.clear();
    history.replaceState(null, "", "/agendabela/automatize-seu-atendimento?checkout=voltou");
    render(<HeroComponent />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("voltar do checkout pelo cache do navegador (bfcache) mostra Desistiu", async () => {
    sessionStorage.setItem(
      "agendabela_signup_web",
      JSON.stringify({ profileId: "p", email: "a@b.co", firstName: "Ana", accessLinkSent: true, checkoutPending: true }),
    );
    history.replaceState(null, "", "/agendabela/automatize-seu-atendimento");
    // Primeira montagem já consome a marca; simula uma nova ida ao checkout.
    render(<HeroComponent />);
    await screen.findByText("Tudo bem, sua conta continua criada.");
    sessionStorage.setItem(
      "agendabela_signup_web",
      JSON.stringify({ profileId: "p", email: "a@b.co", firstName: "Ana", accessLinkSent: true, checkoutPending: true }),
    );
    const ev = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(ev, "persisted", { value: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(await screen.findByText("Tudo bem, sua conta continua criada.")).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem("agendabela_signup_web")!).checkoutPending).toBe(false);
    sessionStorage.clear();
  });
});

