import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ky } from "@/lib/http";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const handleClick = async () => {
    const res = await ky.get<string>("healthz").json();

    toast(res, {
      position: "top-center",
    });
  };

  return (
    <div className="flex justify-center">
      <Button
        className="cursor-pointer min-w-12"
        onClick={handleClick}
      >
        Hi
      </Button>
    </div>
  );
}
