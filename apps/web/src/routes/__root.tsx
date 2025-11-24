import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import TanStackRouterDevtools from "@/integrations/tanstack-router/devtools";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />

      <TanStackDevtools
        plugins={[TanStackRouterDevtools, TanStackQueryDevtools]}
      />
    </>
  ),
});
