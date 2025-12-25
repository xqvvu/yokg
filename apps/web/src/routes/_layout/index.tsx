import { createFileRoute } from "@tanstack/react-router";
import ky from "ky";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";

export const Route = createFileRoute("/_layout/")({
  component: Overview,
});

function Overview() {
  const handleClick = async () => {
    const ok = await http.get("healthz").json<string>();
    toast.success(ok, {
      position: "top-right",
    });
  };

  const handleCheckFileType = async () => {
    const res = await ky.get("http://localhost:9001/yokg-public/IMG_3400.jpeg");
    if (!res.body) {
      toast.error("stream is empty", {
        position: "top-center",
      });
      return;
    }
  };

  return (
    <div className="text-center">
      <Button
        className="cursor-pointer"
        onClick={handleClick}
      >
        Check Health
      </Button>

      <Button onClick={handleCheckFileType}>Check file type</Button>
    </div>
  );
}
