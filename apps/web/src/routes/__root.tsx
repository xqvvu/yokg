import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import TanStackQueryDevtools from "@/__devtools/tanstack-query";
import TanStackRouterDevtools from "@/__devtools/tanstack-router";
import { Toaster } from "@/components/ui/sonner";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster />

      <TanStackDevtools plugins={[TanStackRouterDevtools, TanStackQueryDevtools]} />
    </>
  ),
});
