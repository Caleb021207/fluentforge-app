import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { WordBankEntry } from '@/types/exercises';

const WordBank = () => {
  const { isAuthenticated } = useAuthGuard();
  const { toast } = useToast();
  const [words, setWords] = useState<WordBankEntry[]>([]);
  const [dueWords, setDueWords] = useState<WordBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWords();
    }
  }, [isAuthenticated]);

  const fetchWords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allWords } = await supabase
        .from('user_wordbank')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: due } = await supabase
        .from('user_wordbank')
        .select('*')
        .eq('user_id', user.id)
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at');

      setWords(allWords || []);
      setDueWords(due || []);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const deleteWord = async (lemma: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_wordbank')
        .delete()
        .eq('user_id', user.id)
        .eq('lemma', lemma);

      toast({ title: 'Word deleted' });
      fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const reviewWord = async (success: boolean) => {
    const word = dueWords[currentReviewIndex];
    if (!word) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // SM-2 lite algorithm
      const intervals = [1, 2, 4, 7, 14, 30];
      let newBucket = success 
        ? Math.min(word.srs_bucket + 1, intervals.length - 1)
        : Math.max(0, word.srs_bucket - 1);

      const daysToAdd = intervals[newBucket];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysToAdd);

      await supabase
        .from('user_wordbank')
        .update({
          srs_bucket: newBucket,
          next_review_at: nextReview.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          review_count: word.review_count + 1,
          strength: Math.min(1, word.strength + (success ? 0.1 : -0.15))
        })
        .eq('user_id', user.id)
        .eq('lemma', word.lemma);

      if (currentReviewIndex < dueWords.length - 1) {
        setCurrentReviewIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        toast({
          title: '🎉 Review Complete!',
          description: `Reviewed ${dueWords.length} words`
        });
        setReviewMode(false);
        setCurrentReviewIndex(0);
        fetchWords();
      }
    } catch (error) {
      console.error('Error reviewing word:', error);
    }
  };

  const startReview = () => {
    if (dueWords.length === 0) {
      toast({
        title: 'No words due',
        description: 'Come back later for more reviews!'
      });
      return;
    }
    setReviewMode(true);
    setCurrentReviewIndex(0);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (reviewMode && dueWords.length > 0) {
    const word = dueWords[currentReviewIndex];
    
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setReviewMode(false)}>
              Exit Review
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentReviewIndex + 1} / {dueWords.length}
            </div>
          </div>
        </div>

        <Card 
          className="p-8 min-h-[400px] flex items-center justify-center cursor-pointer"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="text-center w-full">
            {!showAnswer ? (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">{word.translation}</div>
                {word.cefr_tag && (
                  <Badge variant="outline">{word.cefr_tag}</Badge>
                )}
                <p className="text-sm text-muted-foreground mt-6">
                  Tap to reveal
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-5xl font-bold">{word.display}</div>
                {word.ipa && (
                  <div className="text-xl text-muted-foreground">/{word.ipa}/</div>
                )}
                <Button
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); speak(word.display); }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
              </div>
            )}
          </div>
        </Card>

        {showAnswer && (
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => reviewWord(false)}
            >
              Need Practice
            </Button>
            <Button
              className="flex-1"
              onClick={() => reviewWord(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Got It!
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Word Bank</h1>
            <p className="text-muted-foreground">Your saved vocabulary</p>
          </div>
          {dueWords.length > 0 && (
            <Button onClick={startReview} size="lg">
              Review Now ({dueWords.length})
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Words ({words.length})</TabsTrigger>
          <TabsTrigger value="due">Due for Review ({dueWords.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.map(word => (
              <Card key={word.lemma} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl font-bold">{word.display}</div>
                    {word.ipa && (
                      <div className="text-sm text-muted-foreground">/{word.ipa}/</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speak(word.display)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWord(word.lemma)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">{word.translation}</div>
                
                <div className="flex gap-2 items-center">
                  {word.cefr_tag && (
                    <Badge variant="outline" className="text-xs">{word.cefr_tag}</Badge>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Strength: {Math.round(word.strength * 100)}%
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  Reviews: {word.review_count}
                </div>
              </Card>
            ))}
          </div>

          {words.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No saved words yet. Save words from lessons to build your vocabulary!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="due" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueWords.map(word => (
              <Card key={word.lemma} className="p-4 border-primary">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl font-bold">{word.display}</div>
                    {word.ipa && (
                      <div className="text-sm text-muted-foreground">/{word.ipa}/</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(word.display)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">{word.translation}</div>
                
                {word.cefr_tag && (
                  <Badge variant="outline" className="text-xs">{word.cefr_tag}</Badge>
                )}
              </Card>
            ))}
          </div>

          {dueWords.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No words due for review. Great job keeping up! 🎉
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WordBank;
