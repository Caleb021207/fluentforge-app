import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson,
  Loader2,
  Calendar
} from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface ExportReportButtonProps {
  teacherId: string | undefined;
}

type ReportFormat = 'csv' | 'json';

const ExportReportButton = ({ teacherId }: ExportReportButtonProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('csv');
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleExport = async (format: ReportFormat) => {
    setSelectedFormat(format);
    setShowDateDialog(true);
  };

  const executeExport = async () => {
    if (!teacherId) {
      toast({
        title: t("error"),
        description: t("notAuthenticated"),
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setShowDateDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-teacher-report', {
        body: {
          teacherId,
          format: selectedFormat,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      if (error) throw error;

      // Create downloadable file
      const blob = selectedFormat === 'csv' 
        ? new Blob([data.content], { type: 'text/csv' })
        : new Blob([JSON.stringify(data.content, null, 2)], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher-report-${format(new Date(), 'yyyy-MM-dd')}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t("exportSuccess"),
        description: t("reportDownloaded")
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: t("exportError"),
        description: t("failedToGenerateReport"),
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t("exportReport")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("exportAsCSV")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            {t("exportAsJSON")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("selectDateRange")}</DialogTitle>
            <DialogDescription>
              {t("selectDateRangeDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDateDialog(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={executeExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t("generateReport")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportReportButton;
