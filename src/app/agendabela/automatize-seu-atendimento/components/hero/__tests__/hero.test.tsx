import { render, screen } from "@testing-library/react";
import { HeroComponent } from "../hero";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";

const queryClient = new QueryClient();

describe("HeroComponent", () => {
  it("should render the HeroComponent", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <HeroComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    expect(
      screen.getByText("Tem alguém cuidando da sua agenda agora.")
    ).toBeInTheDocument();
  });
});
