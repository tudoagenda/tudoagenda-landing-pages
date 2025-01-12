import { render, screen } from "@testing-library/react";
import { TrustComponent } from "../trust";

describe("TrustComponent", () => {
  it("should render the TrustComponent", () => {
    render(<TrustComponent />);
    expect(screen.getByAltText("Santander X logo")).toBeInTheDocument();
    expect(screen.getByAltText("Founders Club logo")).toBeInTheDocument();
  });
});
