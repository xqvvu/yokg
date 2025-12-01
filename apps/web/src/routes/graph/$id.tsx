import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/graph/$id")({
  component: Graph,
});

function Graph() {
  const { id } = Route.useParams();
  return <div>Hello "/graph/{id}"!</div>;
}
