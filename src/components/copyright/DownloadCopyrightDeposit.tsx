
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileArchive, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScriptInstructions from "./ScriptInstructions";

const DownloadCopyrightDeposit = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPackageReady, setIsPackageReady] = useState(false);

  const generatePackage = async () => {
    setIsGenerating(true);
    toast({
      title: "Creating Package",
      description: "Please wait while we prepare your copyright deposit package...",
    });

    try {
      // Simulate package generation (in a real app, this would call a backend API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsPackageReady(true);
      toast({
        title: "Package Ready",
        description: "Your copyright deposit package has been created successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error creating the copyright deposit package.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button 
          onClick={generatePackage}
          size="lg"
          className="mt-2"
          disabled={isGenerating || isPackageReady}
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          {isGenerating ? "Creating Package..." : "Generate Package"}
        </Button>
        
        <Button 
          onClick={handleDownload}
          size="lg"
          className="mt-2"
          disabled={!isPackageReady}
        >
          <FileArchive className="mr-2 h-5 w-5" />
          Download Package
        </Button>
      </div>
      
      <div className="w-full mt-4">
        {isPackageReady ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center font-medium">
              Your copyright deposit package has been created successfully! You can now download it.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-center">
              Click "Generate Package" to create your copyright deposit package. Once created, you can download it.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 max-w-lg text-center">
        <p>
          This package contains all necessary files for copyright registration, including source code, instructional content, and legal documentation.
        </p>
      </div>
    </div>
  );
};

export default DownloadCopyrightDeposit;
