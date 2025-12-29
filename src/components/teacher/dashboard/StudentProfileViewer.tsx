import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, AlertTriangle, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalization } from "@/context/LocalizationContext";
import { Json } from "@/integrations/supabase/types";

interface StudentProfileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

interface GrammarWeakness {
  issue: string;
  count: number;
  examples?: string[];
}

interface ConversationMemory {
  id: string;
  topic: string | null;
  conversation_summary: string | null;
  cefr_level_demonstrated: string | null;
  vocabulary_used: string[] | null;
  created_at: string | null;
}

export const StudentProfileViewer: React.FC<StudentProfileViewerProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName
}) => {
  const { t } = useLocalization();
  const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  // Fetch student learning profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['student-learning-profile', studentId, academicYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_learning_profiles')
        .select('*')
        .eq('student_id', studentId)
        .eq('academic_year', academicYear)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: open && !!studentId
  });

  // Fetch conversation memories
  const { data: memories, isLoading: isLoadingMemories } = useQuery({
    queryKey: ['student-conversation-memory', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_conversation_memory')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ConversationMemory[];
    },
    enabled: open && !!studentId
  });

  const isLoading = isLoadingProfile || isLoadingMemories;

  // Parse JSON fields safely
  const parseJsonArray = (json: Json | null): string[] => {
    if (!json) return [];
    if (Array.isArray(json)) return json.map(String);
    return [];
  };

  const parseGrammarWeaknesses = (json: Json | null): GrammarWeakness[] => {
    if (!json) return [];
    if (Array.isArray(json)) {
      return json.map(item => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return {
            issue: String(obj.issue || obj.pattern || 'Unknown'),
            count: Number(obj.count || obj.frequency || 1),
            examples: obj.examples ? (obj.examples as string[]) : []
          };
        }
        return { issue: String(item), count: 1, examples: [] };
      });
    }
    return [];
  };

  const strengths = parseJsonArray(profile?.strengths);
  const struggles = parseJsonArray(profile?.primary_struggles);
  const grammarWeaknesses = parseGrammarWeaknesses(profile?.grammar_weaknesses);
  const vocabularyGaps = profile?.vocabulary_gaps || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t("studentProfile") || "Student Learning Profile"}
          </DialogTitle>
          <DialogDescription>
            {t("aiAnalysisFor") || "AI analysis for"} <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !profile ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{t("noProfileData") || "No profile data yet"}</p>
            <p className="text-sm mt-1">
              {t("profileDataWillAppear") || "Profile data will appear after the student completes conversations with AI profiling enabled."}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* CEFR Level */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{t("estimatedLevel") || "Estimated Level"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.estimated_cefr_level && (
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {profile.estimated_cefr_level}
                      </Badge>
                    )}
                    {profile.estimated_actfl_level && (
                      <Badge variant="secondary">
                        ACTFL: {profile.estimated_actfl_level}
                      </Badge>
                    )}
                    {!profile.estimated_cefr_level && !profile.estimated_actfl_level && (
                      <span className="text-muted-foreground text-sm">{t("notYetDetermined") || "Not yet determined"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {strengths.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      {t("strengths") || "Strengths"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((strength, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Primary Struggles */}
              {struggles.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      {t("primaryStruggles") || "Areas for Improvement"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {struggles.map((struggle, idx) => (
                        <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">
                          {struggle}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grammar Weaknesses */}
              {grammarWeaknesses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-destructive" />
                      {t("grammarWeaknesses") || "Grammar Patterns to Address"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {grammarWeaknesses.slice(0, 5).map((weakness, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium">{weakness.issue}</span>
                          {weakness.count > 1 && (
                            <span className="text-muted-foreground ml-2">({weakness.count}x)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Vocabulary Gaps */}
              {vocabularyGaps.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      {t("vocabularyGaps") || "Vocabulary to Practice"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vocabularyGaps.slice(0, 10).map((word, idx) => (
                        <Badge key={idx} variant="secondary">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Conversations */}
              {memories && memories.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      {t("recentConversations") || "Recent Conversations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {memories.slice(0, 5).map((memory) => (
                        <div key={memory.id} className="text-sm border-b pb-2 last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{memory.topic || t("generalConversation") || "General conversation"}</span>
                            {memory.cefr_level_demonstrated && (
                              <Badge variant="outline" className="text-xs">
                                {memory.cefr_level_demonstrated}
                              </Badge>
                            )}
                          </div>
                          {memory.conversation_summary && (
                            <p className="text-muted-foreground mt-1 line-clamp-2">
                              {memory.conversation_summary}
                            </p>
                          )}
                          {memory.created_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(memory.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty state for sections */}
              {!strengths.length && !struggles.length && !grammarWeaknesses.length && !vocabularyGaps.length && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">
                    {t("limitedProfileData") || "Limited data available. More insights will appear as the student has more conversations."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
