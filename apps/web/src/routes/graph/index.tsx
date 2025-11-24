import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/graph/")({
  component: Graph,
});

function Graph() {
  return <div>Hello "/graph/"!</div>;
}
