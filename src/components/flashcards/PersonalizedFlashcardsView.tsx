import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalizedFlashcards, PersonalizedFlashcard } from '@/hooks/usePersonalizedFlashcards';
import { FlashcardStudyMode } from './FlashcardStudyMode';
import { Sparkles, BookOpen, Trophy, Clock, Plus, Loader2 } from 'lucide-react';

export const PersonalizedFlashcardsView: React.FC = () => {
  const { 
    flashcards, 
    dueCards, 
    loading, 
    generating, 
    stats,
    generateFlashcards,
    updateMastery,
    deleteFlashcard
  } = usePersonalizedFlashcards();
  
  const [studyMode, setStudyMode] = useState(false);
  const [studyCards, setStudyCards] = useState<PersonalizedFlashcard[]>([]);

  const startStudySession = (cards: PersonalizedFlashcard[]) => {
    setStudyCards(cards);
    setStudyMode(true);
  };

  const endStudySession = () => {
    setStudyMode(false);
    setStudyCards([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (studyMode && studyCards.length > 0) {
    return (
      <FlashcardStudyMode
        cards={studyCards}
        onComplete={endStudySession}
        onUpdateMastery={updateMastery}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.due}</p>
                <p className="text-sm text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.learning}</p>
                <p className="text-sm text-muted-foreground">Learning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.mastered}</p>
                <p className="text-sm text-muted-foreground">Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {dueCards.length > 0 && (
          <Button onClick={() => startStudySession(dueCards)} size="lg">
            <Clock className="mr-2 h-4 w-4" />
            Study Due Cards ({dueCards.length})
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={generateFlashcards}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate New Cards
        </Button>
      </div>

      {/* Flashcard Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="due">Due ({stats.due})</TabsTrigger>
          <TabsTrigger value="learning">Learning ({stats.learning})</TabsTrigger>
          <TabsTrigger value="mastered">Mastered ({stats.mastered})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <FlashcardGrid 
            cards={flashcards} 
            onStudy={startStudySession}
            onDelete={deleteFlashcard}
          />
        </TabsContent>

        <TabsContent value="due" className="mt-4">
          <FlashcardGrid 
            cards={dueCards} 
            onStudy={startStudySession}
            onDelete={deleteFlashcard}
          />
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <FlashcardGrid 
            cards={flashcards.filter(c => c.mastery_level > 0 && c.mastery_level < 4)} 
            onStudy={startStudySession}
            onDelete={deleteFlashcard}
          />
        </TabsContent>

        <TabsContent value="mastered" className="mt-4">
          <FlashcardGrid 
            cards={flashcards.filter(c => c.mastery_level >= 4)} 
            onStudy={startStudySession}
            onDelete={deleteFlashcard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FlashcardGridProps {
  cards: PersonalizedFlashcard[];
  onStudy: (cards: PersonalizedFlashcard[]) => void;
  onDelete: (id: string) => void;
}

const FlashcardGrid: React.FC<FlashcardGridProps> = ({ cards, onStudy, onDelete }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No flashcards in this category</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return 'bg-purple-500/10 text-purple-500';
      case 'vocabulary': return 'bg-blue-500/10 text-blue-500';
      case 'phrase': return 'bg-green-500/10 text-green-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMasteryLabel = (level: number) => {
    if (level === 0) return 'New';
    if (level <= 2) return 'Learning';
    if (level <= 3) return 'Reviewing';
    return 'Mastered';
  };

  return (
    <div className="space-y-4">
      {cards.length > 1 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onStudy(cards)}
        >
          Study All ({cards.length})
        </Button>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id} className="group relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{card.term}</CardTitle>
                <Badge className={getCategoryColor(card.category)}>
                  {card.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{card.definition}</p>
              
              {card.example && (
                <p className="text-sm italic border-l-2 border-primary/20 pl-3">
                  "{card.example}"
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {getMasteryLabel(card.mastery_level)}
                  </span>
                  <Progress 
                    value={(card.mastery_level / 5) * 100} 
                    className="w-16 h-1.5"
                  />
                </div>

                {card.cefr_level && (
                  <Badge variant="outline" className="text-xs">
                    {card.cefr_level}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStudy([card])}
                >
                  Study
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(card.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
