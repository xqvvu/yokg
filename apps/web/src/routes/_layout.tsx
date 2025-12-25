import { BellIcon } from "@phosphor-icons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/routes/-layouts/header";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  return (
    <div>
      <Header>
        <nav>Nav</nav>

        <div className="ml-auto">
          <div className="flex flex-row items-center space-x-4">
            <Button
              className="cursor-pointer relative"
              size="icon-sm"
              variant="outline"
            >
              <div className="absolute -right-1 -top-1 rounded-full size-2.5 flex bg-primary" />

              <BellIcon />
            </Button>

            <Separator orientation="vertical" />

            <Avatar className="size-7.5">
              <AvatarImage src="http://localhost:9001/yokg-public/IMG_3400.jpeg" />
              <AvatarFallback>{"xqvvu".slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </Header>

      <Outlet />
    </div>
  );
}
