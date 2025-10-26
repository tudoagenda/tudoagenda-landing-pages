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

  it("should show success modal on successful user creation", async () => {
    // Mock the fetch function to simulate a successful response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: "User created successfully",
            user: "test@example.com",
            temporaryPassword: "1234Temp",
          }),
      })
    ) as jest.Mock;

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

    // Wait for the success modal to appear
    expect(await screen.findByText("🎉 Cadastro realizado com sucesso!")).toBeInTheDocument();
    expect(
      screen.getByText(/Acesse o sistema com seu e-mail e senha temporária/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("test@example.com")
    ).toBeInTheDocument();
    expect(
      screen.getByText("1234Temp")
    ).toBeInTheDocument();
  });
});
