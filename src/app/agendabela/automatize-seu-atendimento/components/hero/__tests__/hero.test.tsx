import { act, render, screen } from "@testing-library/react";
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

  it("card fixo do celular some quando o rodapé entra na tela", () => {
    let notify: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
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
    document.body.appendChild(footer);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <HeroComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    const card = container.querySelector<HTMLElement>("div.fixed")!;
    expect(observed).toEqual([footer]);
    expect(card).not.toHaveAttribute("aria-hidden");

    act(() => notify([{ isIntersecting: true }]));
    expect(card).toHaveAttribute("aria-hidden", "true");
    expect(card.hasAttribute("inert")).toBe(true);
    expect(card.className).toMatch(/opacity-0/);

    act(() => notify([{ isIntersecting: false }]));
    expect(card).not.toHaveAttribute("aria-hidden");

    // digitando no card: o rodapé aparece, mas o card não some
    const input = card.querySelector("input")!;
    act(() => input.focus());
    act(() => notify([{ isIntersecting: true }]));
    expect(card).not.toHaveAttribute("aria-hidden");
    act(() => input.blur());
    expect(card).toHaveAttribute("aria-hidden", "true");

    footer.remove();
    window.IntersectionObserver = original;
  });
});
