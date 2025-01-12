import { render, screen } from "@testing-library/react";
import { FormComponent } from "../form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("FormComponent", () => {
  it("should render the FormComponent", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FormComponent />
      </QueryClientProvider>
    );
    expect(
      screen.getByPlaceholderText("Digite seu e-mail aqui")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Teste Gratuitamente/i })
    ).toBeInTheDocument();
  });
});
