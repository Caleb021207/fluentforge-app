
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks/use-toast';

interface JoinClassFormProps {
  onJoin: (code: string) => Promise<boolean>;
}

export function JoinClassForm({ onJoin }: JoinClassFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await onJoin(code);
      if (success) {
        setCode('');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorJoiningClass"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("enterClassCode")}
          className="uppercase"
          maxLength={6}
          minLength={6}
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={code.length !== 6 || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("joining")}
          </>
        ) : (
          t("joinClass")
        )}
      </Button>
    </form>
  );
}
