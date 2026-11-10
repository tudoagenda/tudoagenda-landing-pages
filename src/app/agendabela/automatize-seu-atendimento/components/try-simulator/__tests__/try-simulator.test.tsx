import { fireEvent, render, screen } from "@testing-library/react";
import { TrySimulatorComponent } from "../try-simulator";
import { TestimonialsComponent } from "../../testimonials";

describe("links para o simulador (Experimente)", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("seção leva à Jornada 1 com ?ref= e mede cta_click", () => {
    render(<TrySimulatorComponent />);

    expect(
      screen.getByRole("heading", { name: "Quer ver antes? Teste aqui, sem cadastro." }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Experimentar o Agenda Bela" });
    expect(link).toHaveAttribute(
      "href",
      "/agendabela/experimente?ref=automatize_secao#marcar-cliente",
    );
    expect(link).not.toHaveAttribute("target");

    link.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(link);
    expect(window.dataLayer).toEqual([
      expect.objectContaining({
        event: "cta_click",
        cta_location: "automatize_secao_simulador",
        landing_slug: "automatize-seu-atendimento",
      }),
    ]);
  });

  it("avaliações terminam com o link para ver a Bela na prática", () => {
    render(<TestimonialsComponent />);

    const link = screen.getByRole("link", { name: "Veja o que a Bela faz na prática →" });
    expect(link).toHaveAttribute("href", "/agendabela/experimente?ref=automatize_avaliacoes");
    link.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(link);
    expect(window.dataLayer?.at(-1)).toEqual(
      expect.objectContaining({ event: "cta_click", cta_location: "automatize_avaliacoes" }),
    );
  });

  it("nenhum link interno usa utm_* (sobrescreveria a atribuição da sessão)", () => {
    const { container } = render(
      <>
        <TrySimulatorComponent />
        <TestimonialsComponent />
      </>,
    );
    container.querySelectorAll("a").forEach((a) => {
      expect(a.getAttribute("href")).not.toMatch(/utm_/);
    });
  });
});
