import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { useVocabReview, ReviewRating } from "@/hooks/useVocabReview";
import SpeakButton from "@/components/ui/speak-button";
import { ArrowLeft, Eye, Layers } from "lucide-react";

// Simple-English labels: many reviewers read at A1-A2 level.
const RATINGS: Array<{ rating: ReviewRating; label: string; hint: string; variant: "destructive" | "outline" | "secondary" | "default" }> = [
  { rating: 1, label: "Again", hint: "I did not know it", variant: "destructive" },
  { rating: 2, label: "Hard", hint: "It was difficult", variant: "outline" },
  { rating: 3, label: "Good", hint: "I knew it", variant: "secondary" },
  { rating: 4, label: "Easy", hint: "I knew it fast", variant: "default" },
];

/** Daily spaced-repetition deck scheduled by FSRS on the server. */
const VocabReview: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { cards, dueCount, newCount, retention, loading, error, grade, reload } = useVocabReview();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  // Session size is fixed when the deck loads so the progress bar is stable.
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setSessionTotal(cards.length);
  }, [cards.length]);

  const card = cards[index];
  const sessionPct = sessionTotal > 0 ? Math.min(100, Math.round((index / sessionTotal) * 100)) : 0;

  const handleGrade = async (rating: ReviewRating) => {
    if (!card || saving) return;
    setSaving(true);
    const res = await grade(card.vocabulary.id, rating);
    setSaving(false);
    if (!res) {
      toast.error("Could not save that review.");
      return;
    }
    setReviewed((r) => r + 1);
    if (res.xp_awarded > 0) toast.success(`+${res.xp_awarded} XP`);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!isAuthenticated) return <AuthRequiredPrompt />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Path
        </Button>
        <span className="text-sm text-muted-foreground">
          Target retention {Math.round(retention * 100)}%
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" /> Vocabulary Review
        </h1>
        <p className="text-muted-foreground mt-1">
          {dueCount} due · {newCount} new · {reviewed} reviewed today
        </p>
        {sessionTotal > 0 && <Progress value={sessionPct} className="h-2 mt-3" />}
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!card ? (
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-muted-foreground">
              {reviewed > 0
                ? `Deck cleared — ${reviewed} card${reviewed === 1 ? "" : "s"} reviewed. Come back when more are due.`
                : "Nothing is due right now. New words unlock as you work through lessons."}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => reload()} variant="outline">
                Refresh queue
              </Button>
              <Button onClick={() => navigate("/learn")}>Back to path</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1">
                <CardTitle className="text-3xl">{card.vocabulary.lemma}</CardTitle>
                <SpeakButton text={card.vocabulary.lemma} />
              </div>
              <div className="flex gap-2">
                {card.is_new && <Badge variant="secondary">New</Badge>}
                {card.vocabulary.cefr_level && (
                  <Badge variant="outline">{card.vocabulary.cefr_level}</Badge>
                )}
              </div>
            </div>
            {card.vocabulary.ipa && (
              <p className="text-sm text-muted-foreground">/{card.vocabulary.ipa}/</p>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {revealed ? (
              <div className="space-y-3">
                {card.vocabulary.translation_l1 && (
                  <p className="text-lg">{card.vocabulary.translation_l1}</p>
                )}
                {card.vocabulary.part_of_speech && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {card.vocabulary.part_of_speech}
                  </p>
                )}
                {card.vocabulary.example_sentence && (
                  <div className="flex items-start gap-1">
                    <p className="text-sm italic border-l-2 border-primary/30 pl-3 flex-1">
                      {card.vocabulary.example_sentence}
                    </p>
                    <SpeakButton text={card.vocabulary.example_sentence} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
                  {RATINGS.map((r) => (
                    <Button
                      key={r.rating}
                      variant={r.variant}
                      disabled={saving}
                      onClick={() => handleGrade(r.rating)}
                      className="flex-col h-auto py-2"
                    >
                      <span>{r.label}</span>
                      <span className="text-[10px] opacity-80">{r.hint}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <Button onClick={() => setRevealed(true)} className="w-full">
                <Eye className="mr-2 h-4 w-4" /> Show answer
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Seen {card.reps} time{card.reps === 1 ? "" : "s"} · {card.lapses} lapse
              {card.lapses === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VocabReview;
