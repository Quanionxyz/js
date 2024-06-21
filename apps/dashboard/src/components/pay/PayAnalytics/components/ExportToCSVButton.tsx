import { useToast } from "@/components/ui/use-toast";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../../../../@/components/ui/Spinner/Spinner";
import { Button } from "../../../../@/components/ui/button";

export function ExportToCSVButton(props: {
  getData: () => Promise<{ header: string[]; rows: string[][] }>;
  fileName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      className="border flex gap-2 items-center text-xs"
      onClick={async () => {
        setStatus("loading");
        try {
          const data = await props.getData();
          exportToCSV(props.fileName, data);
          setStatus("idle");
          toast({
            title: "Exported Successfully",
            description: "CSV file has been downloaded",
          });
        } catch {
          toast({
            title: "Failed to download CSV",
            variant: "destructive",
          });
          setStatus("error");
        }
      }}
    >
      {status === "loading" ? (
        <>
          Downloading
          <Spinner className="size-3" />
        </>
      ) : (
        <>
          <DownloadIcon className="size-3" />
          Export as CSV
        </>
      )}
    </Button>
  );
}

function exportToCSV(
  fileName: string,
  data: { header: string[]; rows: string[][] },
) {
  const { header, rows } = data;
  const csvContent = `data:text/csv;charset=utf-8,${header.join(",")}\n${rows
    .map((e) => e.join(","))
    .join("\n")}`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}
