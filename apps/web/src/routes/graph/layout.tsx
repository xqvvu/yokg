import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/graph")({
  component: GraphLayout,
});

function GraphLayout() {
  return <Outlet />;
}
