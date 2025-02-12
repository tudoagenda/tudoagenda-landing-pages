import { render, screen } from "@testing-library/react";
import { TestimonialComponent } from "../testimonial";

describe("TestimonialComponent", () => {
  it("should render the TestimonialComponent", () => {
    render(<TestimonialComponent />);
    expect(
      screen.getByText(/O Agenda Bela facilitou muito o dia-a-dia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("MARIA JOANA, PROPRIETÁRIA DO SALÃO PARIS")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Teste Gratuitamente/i })
    ).toBeInTheDocument();
  });
});
