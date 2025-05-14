
import React, { useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import AccuracyOverview from '@/components/accuracy/AccuracyOverview';
import { LanguageMetrics } from '@/types/chat';
import { useLanguageAnalysis } from '@/hooks/useLanguageAnalysis';

interface ViewLanguageMetricsButtonProps {
  messages: { role: "user" | "assistant" | "system"; content: string; }[];
  sessionId?: string;
}

export default function ViewLanguageMetricsButton({ messages, sessionId }: ViewLanguageMetricsButtonProps) {
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const { analyzeConversation, isAnalyzing, lastMetrics } = useLanguageAnalysis();
  const [metrics, setMetrics] = useState<LanguageMetrics | null>(null);

  const handleViewMetrics = async () => {
    try {
      // Only analyze if we don't have metrics yet or if we have new messages
      if (!metrics || (lastMetrics && messages.length > lastMetrics.messageCount)) {
        const result = await analyzeConversation(
          messages.map(m => ({ role: m.role as any, content: m.content })), 
          { sessionId, silent: true }
        );
        
        if (result) {
          setMetrics(result);
        }
      } else if (lastMetrics) {
        setMetrics(lastMetrics);
      }
      
      setIsOpen(true);
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
        onClick={handleViewMetrics}
        disabled={isAnalyzing || messages.length < 4}
      >
        <BarChart2 className="h-4 w-4" />
        {t('viewMetrics')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('languageMetrics')}</DialogTitle>
            <DialogDescription>
              {t('languageMetricsDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {metrics ? (
            <AccuracyOverview metrics={metrics} />
          ) : (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
