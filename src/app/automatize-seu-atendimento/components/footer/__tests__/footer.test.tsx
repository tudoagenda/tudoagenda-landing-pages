import { render, screen } from "@testing-library/react";
import { FooterComponent } from "../footer";

describe("FooterComponent", () => {
  it("should render the FooterComponent", () => {
    render(<FooterComponent />);
    expect(
      screen.getByRole("button", { name: /Termos de serviço/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Política de privacidade/i })
    ).toBeInTheDocument();
  });
});
