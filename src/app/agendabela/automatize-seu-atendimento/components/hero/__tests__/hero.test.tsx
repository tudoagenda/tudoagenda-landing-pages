import { render, screen } from "@testing-library/react";
import { HeroComponent } from "../hero";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("HeroComponent", () => {
  it("should render the HeroComponent", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HeroComponent />
      </QueryClientProvider>
    );
    expect(
      screen.getByText("Automatize seu atendimento sem dores de cabeça.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Teste Gratuitamente/i })
    ).toBeInTheDocument();
  });
});
