import { fireEvent, render, screen } from "@testing-library/react";
import { SignupCtaButton } from "../form";

describe("SignupCtaButton", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("um botão só, sem campo de e-mail, que mede lp_cta_clicked e abre o cadastro", () => {
    const onStart = jest.fn();
    render(<SignupCtaButton ctaPosition="sticky_mobile" onStart={onStart} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Começar meus 7 dias grátis" }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: "lp_cta_clicked",
        cta_position: "sticky_mobile",
        cta_intent: "primary",
        landing_slug: "automatize-seu-atendimento",
      }),
    );
  });
});
