
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalization } from '@/context/LocalizationContext';

interface CreateClassFormProps {
  onCreate: (name: string) => Promise<any>;
}

export function CreateClassForm({ onCreate }: CreateClassFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onCreate(name);
    setIsLoading(false);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-6">
      <div className="flex-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("enterClassName")}
          maxLength={50}
          required
        />
      </div>
      <Button type="submit" disabled={!name || isLoading}>
        {isLoading ? t("creating") : t("createClass")}
      </Button>
    </form>
  );
}
