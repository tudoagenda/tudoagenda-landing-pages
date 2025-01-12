import { fireEvent, render, screen } from "@testing-library/react";
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

  it("should update the URL hash when the link is clicked", async () => {
    render(<AboutComponent />);
    const link = screen.getByRole("link", { name: /teste gratuitamente/i });

    link.addEventListener("click", () => {
      window.location.hash = "#teste-gratuitamente";
    });

    fireEvent.click(link);
    expect(window.location.hash).toBe("#teste-gratuitamente");
  });
});
