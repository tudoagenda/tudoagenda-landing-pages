"use client";

import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AmplitudeProvider>
        {children}
      <ReactQueryDevtools initialIsOpen={false} />
      </AmplitudeProvider>
    </QueryClientProvider>
  );
}
