
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';

interface JoinClassFormProps {
  onJoin: (code: string) => Promise<boolean>;
}

export function JoinClassForm({ onJoin }: JoinClassFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onJoin(code);
    setIsLoading(false);
    setCode('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-6">
      <div className="flex-1">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("enterClassCode")}
          className="uppercase"
          maxLength={6}
          minLength={6}
          required
        />
      </div>
      <Button type="submit" disabled={code.length !== 6 || isLoading}>
        {isLoading ? t("joining") : t("joinClass")}
      </Button>
    </form>
  );
}
