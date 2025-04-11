
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DataExportSectionProps {
  onDownloadData: () => void;
}

const DataExportSection = ({ onDownloadData }: DataExportSectionProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="border-t pt-4">
      <Button 
        variant="outline" 
        className="flex items-center"
        onClick={onDownloadData}
      >
        <Download className="mr-2 h-4 w-4" />
        {t("downloadMyData") || "Download my educational data"}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        {t("downloadDataDescription") || "Request a copy of all your educational data stored in our system. This will be prepared and sent to your registered email address."}
      </p>
    </div>
  );
};

export default DataExportSection;
