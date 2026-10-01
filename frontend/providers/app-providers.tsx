"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react"; import { RealtimeProvider } from "./realtime-provider";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}><RealtimeProvider>{children}</RealtimeProvider></QueryClientProvider>;
}

