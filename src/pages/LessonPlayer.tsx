import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import FlashcardExercise from '@/components/exercises/FlashcardExercise';
import ClozeExercise from '@/components/exercises/ClozeExercise';
import ReorderExercise from '@/components/exercises/ReorderExercise';
import TransformExercise from '@/components/exercises/TransformExercise';
import GuidedConvoTextExercise from '@/components/exercises/GuidedConvoTextExercise';
import GuidedConvoVoiceExercise from '@/components/exercises/GuidedConvoVoiceExercise';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import XPNotification from '@/components/ui/xp-notification';
import type { Exercise, Lesson } from '@/types/exercises';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { getXPReward } from '@/utils/levelSystem';
import { GradientBlob } from '@/components/ui/decorative-elements';

const LessonPlayer = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthGuard();
  const { toast } = useToast();
  const { awardXP, showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);

  useEffect(() => {
    if (isAuthenticated && lessonId) {
      fetchLesson();
    }
  }, [isAuthenticated, lessonId]);

  const fetchLesson = async () => {
    if (!lessonId) return;

    try {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonData) {
        setLesson(lessonData);

        const { data: exercisesData } = await supabase
          .from('exercises')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('idx');

        setExercises((exercisesData || []) as unknown as Exercise[]);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt = async (outcome: 'correct' | 'partial' | 'incorrect', score: number) => {
    const currentExercise = exercises[currentIndex];
    if (!currentExercise) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('exercise_attempts').insert({
        user_id: user.id,
        exercise_id: currentExercise.id,
        outcome,
        score,
        duration_ms: 0
      });

      // Award XP using levelSystem utility
      const xp = outcome === 'correct' 
        ? getXPReward('lesson', { difficulty: 'Medium', score })
        : 0;
      setEarnedXP(prev => prev + xp);
      
      if (xp > 0) {
        setLastXPGain(xp);
        setShowXPNotification(true);
        setTimeout(() => setShowXPNotification(false), 2000);
      }

      // Update skill mastery
      if (lesson) {
        const { data: skillData } = await supabase
          .from('skills')
          .select('id')
          .eq('id', lesson.skill_id)
          .single();

        if (skillData) {
          const { data: progressData } = await supabase
            .from('user_skill_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('skill_id', skillData.id)
            .single();

          const oldMastery = progressData?.mastery || 0;
          const newMastery = Math.min(100, 0.8 * oldMastery + 0.2 * score);

          await supabase
            .from('user_skill_progress')
            .upsert({
              user_id: user.id,
              skill_id: skillData.id,
              mastery: newMastery,
              last_practiced_at: new Date().toISOString()
            });
        }
      }

      if (currentIndex < exercises.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 800);
      } else {
        // Lesson complete - award bonus XP
        setTimeout(async () => {
          await awardXP('lesson', { difficulty: 'Medium' });
          toast({
            title: '🎉 Lesson Complete!',
            description: `You earned ${earnedXP + xp} XP!`
          });
          setTimeout(() => navigate('/learn'), 2000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
    }
  };

  const handleSaveWord = async (word: { lemma: string; display: string; translation: string; ipa?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_wordbank').upsert({
        user_id: user.id,
        lemma: word.lemma,
        display: word.display,
        translation: word.translation,
        ipa: word.ipa,
        language: 'en',
        cefr_tag: exercises[currentIndex]?.cefr_tag
      });

      await awardXP('lesson', { difficulty: 'Easy' });

      toast({
        title: '💾 Word Saved!',
        description: `Added "${word.display}" to your word bank (+5 XP)`
      });
    } catch (error) {
      console.error('Error saving word:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!lesson || exercises.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <Button onClick={() => navigate('/learn')}>Back to Learning Path</Button>
        </Card>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <>
      <XPNotification show={showXPNotification} amount={lastXPGain} />
      {levelUpData && (
        <LevelUpModal
          open={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          totalXP={progression?.total_xp || 0}
        />
      )}
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <GradientBlob className="top-20 left-10" />
        <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
        
        <div className="container mx-auto py-8 px-4 max-w-4xl relative z-10">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => navigate('/learn')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentIndex + 1} / {exercises.length}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold gradient-text">{lesson.title}</h1>
                {currentExercise?.cefr_tag && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-full font-semibold shadow-lg"
                  >
                    {currentExercise.cefr_tag}
                  </motion.span>
                )}
              </div>
              <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-palavox-accent via-palavox-teal to-green-500 shadow-lg"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <Card className="p-8 glass shadow-2xl">
        {currentExercise.type === 'flashcard' && (
          <FlashcardExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
            onSaveWord={handleSaveWord}
          />
        )}
        {currentExercise.type === 'cloze' && (
          <ClozeExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
            onSaveWord={handleSaveWord}
          />
        )}
        {currentExercise.type === 'reorder' && (
          <ReorderExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
          />
        )}
        {currentExercise.type === 'transform' && (
          <TransformExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
            onSaveWord={handleSaveWord}
          />
        )}
        {currentExercise.type === 'guided_convo_text' && (
          <GuidedConvoTextExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
          />
        )}
        {currentExercise.type === 'guided_convo_voice' && (
          <GuidedConvoVoiceExercise
            exercise={currentExercise}
            onComplete={submitAttempt}
          />
        )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default LessonPlayer;
