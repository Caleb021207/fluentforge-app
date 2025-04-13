
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Clipboard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface GeneratedCodesListProps {
  generatedCodes: string[];
  copiedIndex: number | null;
  onCopyCode: (code: string, index: number) => void;
}

const GeneratedCodesList = ({ 
  generatedCodes, 
  copiedIndex, 
  onCopyCode 
}: GeneratedCodesListProps) => {
  const { t } = useLocalization();

  if (generatedCodes.length === 0) {
    return null;
  }

  return (
    <CardContent>
      <div className="grid gap-2">
        <Label>{t("generatedAccessCodes")}</Label>
        {generatedCodes.map((code, index) => (
          <div key={index} className="flex items-center justify-between rounded-md border p-2">
            <Input
              type="text"
              value={code}
              readOnly
              className="mr-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyCode(code, index)}
              disabled={copiedIndex === index}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" />
                  {t("copy")}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default GeneratedCodesList;
