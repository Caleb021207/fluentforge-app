
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageSquare, Edit } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssessmentResultType, ConversationMessageType } from "@/components/certifications/types/speaking";

interface ProgressData {
  date: string;
  reading?: number;
  writing?: number;
  speaking?: number;
  listening?: number;
}

interface WritingFeedback {
  id: string;
  attempt_id: string;
  score: number;
  feedback: string;
  grammar_score: number;
  vocabulary_score: number;
  coherence_score: number;
  task_completion_score: number;
  created_at: string;
}

interface SpeakingFeedback {
  id: string;
  attempt_id: string;
  pronunciation_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  comprehension_score: number;
  feedback: string;
  conversation_data: ConversationMessageType[];
  created_at: string;
}

const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback[]>([]);
  const [speakingFeedback, setSpeakingFeedback] = useState<SpeakingFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchProgressData(user.id);
        fetchWritingFeedback(user.id);
        fetchSpeakingFeedback(user.id);
      } else {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const fetchProgressData = async (userId: string) => {
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const processedData = processAttemptsData(attempts);
        setProgressData(processedData);
        generateRecommendations(attempts);
      } else {
        toast({
          title: "No Progress Data",
          description: "Complete some certification attempts to see your progress!",
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWritingFeedback = async (userId: string) => {
    try {
      // First, get all writing attempts
      const { data: writingAttempts, error: attemptsError } = await supabase
        .from('certification_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('certification_type', 'writing');

      if (attemptsError) throw attemptsError;
      
      if (writingAttempts && writingAttempts.length > 0) {
        // Get all attempt IDs
        const attemptIds = writingAttempts.map(attempt => attempt.id);
        
        // Fetch writing assessment data for these attempts
        const { data: feedback, error: feedbackError } = await supabase
          .from('writing_assessments')
          .select('*')
          .in('attempt_id', attemptIds)
          .order('created_at', { ascending: false });
          
        if (feedbackError) throw feedbackError;
        
        if (feedback) {
          setWritingFeedback(feedback);
        }
      }
    } catch (error) {
      console.error('Error fetching writing feedback:', error);
    }
  };

  const fetchSpeakingFeedback = async (userId: string) => {
    try {
      // First, get all speaking attempts
      const { data: speakingAttempts, error: attemptsError } = await supabase
        .from('certification_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('certification_type', 'speaking');

      if (attemptsError) throw attemptsError;
      
      if (speakingAttempts && speakingAttempts.length > 0) {
        // Get all attempt IDs
        const attemptIds = speakingAttempts.map(attempt => attempt.id);
        
        // Fetch speaking assessment data for these attempts
        const { data: feedback, error: feedbackError } = await supabase
          .from('speaking_assessments')
          .select('*')
          .in('attempt_id', attemptIds)
          .order('created_at', { ascending: false });
          
        if (feedbackError) throw feedbackError;
        
        if (feedback) {
          setSpeakingFeedback(feedback);
        }
      }
    } catch (error) {
      console.error('Error fetching speaking feedback:', error);
    }
  };

  const processAttemptsData = (attempts: any[]): ProgressData[] => {
    const dataMap = new Map<string, ProgressData>();
    
    attempts.forEach(attempt => {
      const date = new Date(attempt.completed_at).toISOString().split('T')[0];
      const existing = dataMap.get(date) || {
        date,
      };

      // Only set the value for the specific skill that was attempted
      existing[attempt.certification_type as keyof Omit<ProgressData, 'date'>] = attempt.score;
      dataMap.set(date, existing);
    });

    return Array.from(dataMap.values());
  };

  const generateRecommendations = (attempts: any[]) => {
    const latestScores: Record<string, number> = {};
    const skills = ['reading', 'writing', 'speaking', 'listening'];
    
    // Get the latest score for each skill
    skills.forEach(skill => {
      const skillAttempts = attempts.filter(a => a.certification_type === skill);
      if (skillAttempts.length > 0) {
        const latestAttempt = skillAttempts.reduce((latest: any, current: any) => {
          return new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest;
        });
        latestScores[skill] = latestAttempt.score;
      }
    });

    // Generate recommendations based on CEFR levels
    const newRecommendations = skills.map(skill => {
      const score = latestScores[skill] || 0;
      const level = determineLevel(score);
      const recommendation = getRecommendationsForLevel(skill, level);
      
      if (recommendation) {
        return {
          ...recommendation,
          currentLevel: level
        };
      }
      return null;
    }).filter(Boolean);

    setRecommendations(newRecommendations);
  };

  const handleSignIn = () => {
    navigate("/");
  };

  // Custom tooltip component to handle undefined values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any) => (
            entry.value !== undefined && (
              <p key={entry.name} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}%`}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please sign in to view your progress data and personalized recommendations.</p>
        <Button 
          onClick={handleSignIn} 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Your Learning Progress
      </h1>

      {progressData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reading" 
                      stroke="#2563eb" 
                      name="Reading" 
                      connectNulls={true} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="writing" 
                      stroke="#16a34a" 
                      name="Writing" 
                      connectNulls={true} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speaking" 
                      stroke="#dc2626" 
                      name="Speaking" 
                      connectNulls={true} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="listening" 
                      stroke="#9333ea" 
                      name="Listening" 
                      connectNulls={true} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="speaking" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Speaking Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                <span>Writing Feedback</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <Card key={rec.skill}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {rec.skill}
                        <span className="text-sm font-normal">Current Level: {rec.currentLevel}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {rec.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-yellow-600">Areas for Improvement</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {rec.weaknesses.map((weakness: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">{weakness}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {rec.recommendations.map((recommendation: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">{recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="speaking">
              {speakingFeedback.length > 0 ? (
                <div className="space-y-6">
                  {speakingFeedback.map((feedback) => (
                    <Card key={feedback.id} className="overflow-hidden">
                      <CardHeader className="bg-red-50">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span>Speaking Assessment Feedback</span>
                          <span className="text-sm font-normal">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="p-4 border-b">
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Pronunciation</p>
                              <Progress value={feedback.pronunciation_score} className="h-2 mt-1" />
                              <p className="text-xs mt-1 text-right">{feedback.pronunciation_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Fluency</p>
                              <Progress value={feedback.fluency_score} className="h-2 mt-1" />
                              <p className="text-xs mt-1 text-right">{feedback.fluency_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Grammar</p>
                              <Progress value={feedback.grammar_score} className="h-2 mt-1" />
                              <p className="text-xs mt-1 text-right">{feedback.grammar_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Vocabulary</p>
                              <Progress value={feedback.vocabulary_score} className="h-2 mt-1" />
                              <p className="text-xs mt-1 text-right">{feedback.vocabulary_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Comprehension</p>
                              <Progress value={feedback.comprehension_score} className="h-2 mt-1" />
                              <p className="text-xs mt-1 text-right">{feedback.comprehension_score}%</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Detailed Feedback:</h4>
                            <p className="text-sm text-gray-700">{feedback.feedback}</p>
                          </div>
                        </div>
                        {feedback.conversation_data && feedback.conversation_data.length > 0 && (
                          <div className="p-4">
                            <h4 className="font-medium mb-2">Conversation:</h4>
                            <ScrollArea className="h-[200px] rounded-md border p-4">
                              <div className="space-y-4">
                                {feedback.conversation_data.map((message, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`flex ${message.type === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                  >
                                    <div 
                                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.type === 'assistant' 
                                          ? 'bg-gray-100 text-gray-800' 
                                          : 'bg-lingua-primary text-white'
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-lg text-gray-600">
                      No speaking assessment feedback available. Complete a speaking test to see detailed feedback.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="writing">
              {writingFeedback.length > 0 ? (
                <div className="space-y-6">
                  {writingFeedback.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardHeader className="bg-green-50">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span>Writing Assessment Feedback</span>
                          <span className="text-sm font-normal">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Grammar</p>
                            <Progress value={feedback.grammar_score} className="h-2 mt-1" />
                            <p className="text-xs mt-1 text-right">{feedback.grammar_score}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Vocabulary</p>
                            <Progress value={feedback.vocabulary_score} className="h-2 mt-1" />
                            <p className="text-xs mt-1 text-right">{feedback.vocabulary_score}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Coherence</p>
                            <Progress value={feedback.coherence_score} className="h-2 mt-1" />
                            <p className="text-xs mt-1 text-right">{feedback.coherence_score}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Task Completion</p>
                            <Progress value={feedback.task_completion_score} className="h-2 mt-1" />
                            <p className="text-xs mt-1 text-right">{feedback.task_completion_score}%</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Detailed Feedback:</h4>
                          <p className="text-sm text-gray-700">{feedback.feedback}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-lg text-gray-600">
                      No writing assessment feedback available. Complete a writing test to see detailed feedback.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg text-gray-600">Complete some certification attempts to see your progress!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;
