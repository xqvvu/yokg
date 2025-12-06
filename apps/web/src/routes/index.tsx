import { detectFileType } from "@graph-mind/shared/lib/file-type";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: App,
});

// TODO: complete this page
function App() {
  const [_, setFile] = useState<File | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
    const fileType = await detectFileType({
      from: "stream",
      file: file.stream(),
    });
    console.info(fileType);
  };

  return (
    <div className="flex justify-center py-5 gap-4 items-center">
      <Input
        className="cursor-pointer max-w-md"
        onChange={handleFileChange}
        type="file"
      />
    </div>
  );
}
