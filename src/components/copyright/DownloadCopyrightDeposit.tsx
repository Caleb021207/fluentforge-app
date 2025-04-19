
import React from "react";
import { Button } from "@/components/ui/button";
import { FileArchive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScriptInstructions from "./ScriptInstructions";

const DownloadCopyrightDeposit = () => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      // Fetch the ZIP file from the public directory
      const response = await fetch('/Palavox_Copyright_Deposit_2025.zip');
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Palavox_Copyright_Deposit_2025.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your copyright deposit package is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the copyright deposit package.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-semibold">Download Copyright Deposit Package</h2>
      <p className="text-gray-600 text-center">
        Click below to download the complete copyright deposit package including all required files and documentation.
      </p>
      <Button 
        onClick={handleDownload}
        size="lg"
        className="mt-2"
      >
        <FileArchive className="mr-2 h-5 w-5" />
        Download Copyright Package
      </Button>
      <ScriptInstructions />
    </div>
  );
};

export default DownloadCopyrightDeposit;
