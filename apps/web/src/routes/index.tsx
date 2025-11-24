import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/icon";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div>
      <button type="button">
        <Icon
          className="size-7 cursor-pointer"
          icon="icon-[devicon--bun]"
        />
      </button>
    </div>
  );
}
