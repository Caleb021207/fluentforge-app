import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookmarkPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import FlashcardExercise from '@/components/exercises/FlashcardExercise';
import ClozeExercise from '@/components/exercises/ClozeExercise';
import ReorderExercise from '@/components/exercises/ReorderExercise';
import TransformExercise from '@/components/exercises/TransformExercise';
import type { Exercise, Lesson } from '@/types/exercises';
import { Skeleton } from '@/components/ui/skeleton';

const LessonPlayer = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthGuard();
  const { toast } = useToast();
  const { awardXP } = useGamification();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);

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

      // Award XP based on exercise type
      const xpMap: Record<string, number> = {
        flashcard: 5,
        cloze: 10,
        reorder: 10,
        transform: 10,
        guided_convo_text: 15,
        guided_convo_voice: 15
      };

      const xp = outcome === 'correct' ? xpMap[currentExercise.type] || 5 : 0;
      setEarnedXP(prev => prev + xp);

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
        setCurrentIndex(prev => prev + 1);
      } else {
        // Lesson complete
        await awardXP('lesson', { difficulty: 'Medium' });
        toast({
          title: '🎉 Lesson Complete!',
          description: `You earned ${earnedXP + xp} XP!`
        });
        navigate('/learn');
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/learn')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {exercises.length}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {currentExercise?.cefr_tag && (
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                {currentExercise.cefr_tag}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card className="p-6">
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
          />
        )}
      </Card>
    </div>
  );
};

export default LessonPlayer;
