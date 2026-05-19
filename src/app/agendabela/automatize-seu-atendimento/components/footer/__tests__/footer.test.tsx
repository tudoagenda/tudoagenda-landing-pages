import { render, screen } from "@testing-library/react";
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
});
