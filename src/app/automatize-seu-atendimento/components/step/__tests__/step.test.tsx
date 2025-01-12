import { render, screen } from "@testing-library/react";
import { StepComponent } from "../step";

describe("StepComponent", () => {
  it("should render the StepComponent for Step1", () => {
    render(<StepComponent step="Step1" />);
    expect(screen.getByText("1 Configure seu salão")).toBeInTheDocument();
    expect(
      screen.getByText(/Talvez você já conheceu outras plataformas/i)
    ).toBeInTheDocument();
  });

  it("should render the StepComponent for Step2", () => {
    render(<StepComponent step="Step2" />);
    expect(
      screen.getByText("2 Peça seu atendente virtual")
    ).toBeInTheDocument();
  });

  it("should render the StepComponent for Step3", () => {
    render(<StepComponent step="Step3" />);
    expect(
      screen.getByText("3 Agora é só falar para seus clientes")
    ).toBeInTheDocument();
  });
});
