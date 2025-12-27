import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthRequiredPrompt from '@/components/auth/AuthRequiredPrompt';
import { PersonalizedFlashcardsView } from '@/components/flashcards/PersonalizedFlashcardsView';
import { GradientBlob } from '@/components/ui/decorative-elements';
import { Loader2 } from 'lucide-react';

const PersonalFlashcards: React.FC = () => {
  const { t } = useLocalization();
  const { isLoading, isAuthenticated } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="relative min-h-screen">
      <GradientBlob className="fixed top-20 right-10 w-72 h-72 opacity-30" />
      <GradientBlob className="fixed bottom-20 left-10 w-96 h-96 opacity-20" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Flashcards</h1>
          <p className="text-muted-foreground mt-2">
            Personalized flashcards generated from your learning profile
          </p>
        </div>

        <PersonalizedFlashcardsView />
      </div>
    </div>
  );
};

export default PersonalFlashcards;
