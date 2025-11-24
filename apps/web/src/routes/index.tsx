import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex justify-center py-5 gap-4 items-center">
      <Button
        className="cursor-pointer"
        size="icon-sm"
      >
        <Icon
          className="size-5"
          icon="icon-[solar--chat-round-like-outline]"
        />
      </Button>

      <div className="bg-sky-200 size-40 rounded-[100px] corner-squircle" />
    </div>
  );
}
