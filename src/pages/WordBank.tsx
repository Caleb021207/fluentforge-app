import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card, InteractiveCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Volume2, Trash2, CheckCircle2, Search, Sparkles, BookOpen, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerList, slideInUp } from '@/lib/animations';
import { GradientBlob } from '@/components/ui/decorative-elements';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [cefrFilter, setCefrFilter] = useState<string | null>(null);

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
      <div className="relative min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <GradientBlob className="top-20 left-10" />
        
        <div className="container mx-auto py-8 px-4 max-w-2xl relative z-10">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="lg" onClick={() => setReviewMode(false)}>
                Exit Review
              </Button>
              <div className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentReviewIndex + 1} / {dueWords.length}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <InteractiveCard 
              className="p-8 min-h-[400px] flex items-center justify-center cursor-pointer glass hover:shadow-2xl"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showAnswer ? 'answer' : 'question'}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="text-center w-full"
                >
                  {!showAnswer ? (
                    <div className="space-y-6">
                      <div className="text-4xl font-bold gradient-text">{word.translation}</div>
                      {word.cefr_tag && (
                        <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-primary to-accent text-white">
                          {word.cefr_tag}
                        </Badge>
                      )}
                      <p className="text-muted-foreground mt-8 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tap to reveal
                        <Sparkles className="w-4 h-4" />
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-bold"
                      >
                        {word.display}
                      </motion.div>
                      {word.ipa && (
                        <div className="text-2xl text-muted-foreground">/{word.ipa}/</div>
                      )}
                      <Button
                        variant="gradient"
                        size="lg"
                        onClick={(e) => { e.stopPropagation(); speak(word.display); }}
                      >
                        <Volume2 className="w-5 h-5 mr-2" />
                        Listen
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </InteractiveCard>
          </motion.div>

          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 mt-6"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => reviewWord(false)}
              >
                Need Practice
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="flex-1"
                onClick={() => reviewWord(true)}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Got It!
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 right-10" />
      <GradientBlob className="bottom-20 left-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold mb-2 gradient-text flex items-center gap-3">
                <BookOpen className="w-12 h-12" />
                Word Bank
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Your saved vocabulary
              </p>
            </div>
            {dueWords.length > 0 && (
              <Button onClick={startReview} size="lg" variant="gradient" className="shadow-lg glow-accent">
                <Sparkles className="w-4 h-4 mr-2" />
                Review Now ({dueWords.length})
              </Button>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="bg-background/60 backdrop-blur-sm p-1">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-palavox-accent data-[state=active]:to-palavox-teal data-[state=active]:text-white transition-all"
            >
              All Words ({words.length})
            </TabsTrigger>
            <TabsTrigger 
              value="due"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all"
            >
              Due for Review ({dueWords.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {/* Search and filters */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-center flex-wrap"
            >
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search words..."
                  className="pl-10 glass"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={cefrFilter === null ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setCefrFilter(null)}
                >
                  All
                </Button>
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                  <Button
                    key={level}
                    variant={cefrFilter === level ? 'gradient' : 'outline'}
                    size="sm"
                    onClick={() => setCefrFilter(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </motion.div>
            
            
            <motion.div
              variants={staggerList}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {words
                .filter(word => {
                  const matchesSearch = word.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    word.translation.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCefr = cefrFilter === null || word.cefr_tag === cefrFilter;
                  return matchesSearch && matchesCefr;
                })
                .map((word, index) => {
                  const strengthColor = 
                    word.strength > 0.7 ? 'from-green-500 to-emerald-600' :
                    word.strength > 0.4 ? 'from-yellow-500 to-orange-600' :
                    'from-red-500 to-rose-600';
                  
                  return (
                    <motion.div
                      key={word.lemma}
                      variants={slideInUp}
                      custom={index}
                    >
                      <InteractiveCard className="p-5 glass hover:shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-2xl font-bold mb-1">{word.display}</div>
                            {word.ipa && (
                              <div className="text-sm text-muted-foreground italic">/{word.ipa}/</div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => speak(word.display)}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-destructive/10 hover:text-destructive transition-all"
                              onClick={() => deleteWord(word.lemma)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-base text-muted-foreground mb-4 font-medium">{word.translation}</div>
                        
                        <div className="flex gap-2 items-center flex-wrap">
                          {word.cefr_tag && (
                            <Badge className="text-xs bg-gradient-to-r from-primary to-accent text-white">
                              {word.cefr_tag}
                            </Badge>
                          )}
                          <Badge className={`text-xs bg-gradient-to-r ${strengthColor} text-white`}>
                            {Math.round(word.strength * 100)}% mastered
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {word.review_count} reviews
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  );
                })}
            </motion.div>

            {words.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-12 text-center glass">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    No saved words yet. Save words from lessons to build your vocabulary!
                  </p>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="due" className="mt-6">
            <motion.div
              variants={staggerList}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {dueWords.map((word, index) => (
                <motion.div key={word.lemma} variants={slideInUp} custom={index}>
                  <InteractiveCard className="p-5 border-2 border-orange-500/50 glass hover:shadow-xl hover:border-orange-500 transition-all glow-accent">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-2xl font-bold mb-1">{word.display}</div>
                        {word.ipa && (
                          <div className="text-sm text-muted-foreground italic">/{word.ipa}/</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => speak(word.display)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-base text-muted-foreground mb-4 font-medium">{word.translation}</div>
                    
                    {word.cefr_tag && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        {word.cefr_tag} • Due Now
                      </Badge>
                    )}
                  </InteractiveCard>
                </motion.div>
              ))}
            </motion.div>

            {dueWords.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-12 text-center glass">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold mb-2">All caught up!</p>
                  <p className="text-muted-foreground">
                    No words due for review. Great job keeping up! 🎉
                  </p>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WordBank;
