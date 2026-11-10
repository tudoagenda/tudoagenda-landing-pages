import { fireEvent, render, screen } from "@testing-library/react";
import { FooterComponent } from "../footer";

describe("FooterComponent", () => {
  it("should render legal links pointing to the correct routes", () => {
    render(<FooterComponent />);

    const termsLink = screen.getByRole("link", { name: /Termos de serviço/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/termos");

    const privacyLink = screen.getByRole("link", {
      name: /Política de privacidade/i,
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacidade");
  });

  it("should render the company legal identification", () => {
    render(<FooterComponent />);

    expect(
      screen.getByText(/CODEVERSE SERVIÇOS DE TECNOLOGIA LTDA/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/CNPJ 59\.161\.274\/0001-05/i)).toBeInTheDocument();
  });

  describe("bloco Baixe o app", () => {
    beforeEach(() => {
      window.dataLayer = [];
    });

    it("mostra os dois selos sempre, sem depender do aparelho", () => {
      render(<FooterComponent />);

      expect(
        screen.getByRole("heading", { name: "Baixe o app" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Baixe o app e teste 7 dias grátis, sem cartão."),
      ).toBeInTheDocument();

      const apple = screen.getByAltText("Baixar na App Store").closest("a");
      const google = screen.getByAltText("Disponível no Google Play").closest("a");
      expect(apple).toHaveAttribute(
        "href",
        "https://apps.apple.com/br/app/agenda-bela/id6782112738",
      );
      expect(apple?.getAttribute("href")).not.toMatch(/[?&]l=/);
      expect(google?.getAttribute("href")).toContain(
        "id=com.tudoagenda.agendabela.salao&hl=pt_BR&gl=BR",
      );
    });

    it("clique no selo mede store_click com cta_location rodape_selo", () => {
      render(<FooterComponent />);

      fireEvent.click(screen.getByAltText("Baixar na App Store"));
      fireEvent.click(screen.getByAltText("Disponível no Google Play"));

      expect(window.dataLayer).toEqual([
        expect.objectContaining({
          event: "store_click",
          store: "app_store",
          cta_location: "rodape_selo",
          landing_slug: "automatize-seu-atendimento",
        }),
        expect.objectContaining({
          event: "store_click",
          store: "google_play",
          cta_location: "rodape_selo",
        }),
      ]);
      // store do clique anterior não fica no modelo do GTM para o próximo evento
      expect(Object.keys(window.dataLayer![1])).toEqual(
        expect.arrayContaining(["store", "device_os", "cta_location"]),
      );
    });

    it("o rodapé tem id para o card fixo do celular saber quando sumir", () => {
      const { container } = render(<FooterComponent />);
      expect(container.querySelector("footer#rodape")).not.toBeNull();
    });
  });
});
