import { render, screen, fireEvent } from "@testing-library/react";
import { FormComponent } from "../form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";

// Create a new QueryClient instance for each test
const queryClient = new QueryClient();

describe("FormComponent", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should render the FormComponent", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <FormComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );
    expect(
      screen.getByPlaceholderText("Digite seu e-mail aqui")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Teste Gratuitamente/i })
    ).toBeInTheDocument();
  });

  it("should open signup modal on form submission", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AmplitudeProvider>
          <FormComponent />
        </AmplitudeProvider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Digite seu e-mail aqui"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Teste Gratuitamente/i })
    );

    // The signup modal should appear with the step 1 form
    expect(await screen.findByText("Crie sua conta gratuita")).toBeInTheDocument();
  });
});
