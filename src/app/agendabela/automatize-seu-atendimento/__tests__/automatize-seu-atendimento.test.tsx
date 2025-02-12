import { render } from "@testing-library/react";
import AutomatizeSeuAtendimento from "../page";
import Layout from "../layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("AutomatizeSeuAtendimento", () => {
  it("should match the snapshot for the AutomatizeSeuAtendimento component", () => {
    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <AutomatizeSeuAtendimento />
      </QueryClientProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("should match the snapshot for the Layout with AutomatizeSeuAtendimento", () => {
    const { asFragment } = render(
      <Layout>
        <QueryClientProvider client={queryClient}>
          <AutomatizeSeuAtendimento />
        </QueryClientProvider>
      </Layout>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
