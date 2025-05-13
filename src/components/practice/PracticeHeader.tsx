
import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { getLanguageDisplayName } from '@/utils/languageUtils';

interface PracticeHeaderProps {
  targetLanguage: string;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ targetLanguage }) => {
  const { t } = useLocalization();
  const displayLanguage = getLanguageDisplayName(targetLanguage);

  return (
    <div className="mb-6 text-center">
      <h1 className="text-3xl font-bold mb-2">
        {t("textPractice") || "Text Practice"}
      </h1>
      <p className="text-muted-foreground">
        {t("chatWithAITutor") || 
          "Chat with our AI tutor to practice your language skills through text conversations! The AI will help correct your grammar, vocabulary, and usage."}
      </p>
    </div>
  );
};

export default PracticeHeader;
