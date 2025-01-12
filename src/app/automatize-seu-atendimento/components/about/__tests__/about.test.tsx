import { render, screen } from "@testing-library/react";
import { AboutComponent } from "../about";

describe("AboutComponent", () => {
  it("should render the AboutComponent", () => {
    render(<AboutComponent />);
    expect(
      screen.getByText("Saia na frente dos outros salões em 3 passos:")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Teste Gratuitamente/i })
    ).toBeInTheDocument();
  });
});
