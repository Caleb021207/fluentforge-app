
import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Headphones, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceExercise {
  id: string;
  title: string;
  description: string;
  audioPrompt: string;
  expectedResponse: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const UnlimitedVoicePractice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [exercises, setExercises] = useState<VoiceExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<VoiceExercise | null>(null);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  // Mock exercises - in a real app, these would come from a database
  useEffect(() => {
    const mockExercises: VoiceExercise[] = [
      {
        id: "1",
        title: currentLanguage === "english" ? "Basic Greetings" : "Saludos básicos",
        description: currentLanguage === "english" ? "Practice basic Spanish greetings" : "Practica saludos básicos en inglés",
        audioPrompt: "How are you today?",
        expectedResponse: "I am doing well, thank you. How are you?",
        difficulty: "beginner"
      },
      {
        id: "2",
        title: currentLanguage === "english" ? "Ordering Food" : "Pedir comida",
        description: currentLanguage === "english" ? "Practice ordering food in Spanish" : "Practica pedir comida en inglés",
        audioPrompt: "What would you like to order?",
        expectedResponse: "I would like to order a sandwich and a coffee, please.",
        difficulty: "beginner"
      },
      {
        id: "3",
        title: currentLanguage === "english" ? "Giving Directions" : "Dar direcciones",
        description: currentLanguage === "english" ? "Practice giving directions in Spanish" : "Practica dar direcciones en inglés",
        audioPrompt: "Can you tell me how to get to the museum?",
        expectedResponse: "Go straight for two blocks, then turn right. The museum will be on your left.",
        difficulty: "intermediate"
      },
      {
        id: "4",
        title: currentLanguage === "english" ? "Job Interview" : "Entrevista de trabajo",
        description: currentLanguage === "english" ? "Practice job interview questions in Spanish" : "Practica preguntas de entrevista de trabajo en inglés",
        audioPrompt: "Tell me about your previous work experience.",
        expectedResponse: "I have five years of experience in marketing, where I managed social media campaigns for various clients.",
        difficulty: "advanced"
      },
    ];
    
    setExercises(mockExercises);
  }, [currentLanguage]);

  // Filter exercises by difficulty
  const filteredExercises = exercises.filter(ex => ex.difficulty === difficulty);

  useEffect(() => {
    if (filteredExercises.length > 0 && !currentExercise) {
      setCurrentExercise(filteredExercises[0]);
    }
  }, [filteredExercises, currentExercise]);

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.onstart = () => {
          setAudioChunks([]);
        };
        
        recorder.ondataavailable = (e) => {
          setAudioChunks(chunks => [...chunks, e.data]);
        };
        
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await processAudio(audioBlob);
        };
        
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [audioChunks, toast, t]);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) throw new Error("Failed to convert audio to base64");
        
        // Call Supabase function to transcribe audio
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });
        
        if (error) throw error;
        
        setTranscription(data.text);
        
        // Compare with expected response
        if (currentExercise) {
          const similarityScore = calculateSimilarity(data.text.toLowerCase(), currentExercise.expectedResponse.toLowerCase());
          
          if (similarityScore > 0.7) {
            toast({
              title: "Great job!",
              description: "Your pronunciation was excellent!",
            });
          } else if (similarityScore > 0.4) {
            toast({
              title: "Good attempt!",
              description: "Keep practicing to improve your pronunciation.",
            });
          } else {
            toast({
              title: "Try again",
              description: "There were some misunderstandings in your pronunciation.",
            });
          }
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: t("error"),
        description: t("failedToProcessAudio"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple string similarity calculation (Levenshtein distance)
  const calculateSimilarity = (a: string, b: string): number => {
    if (a.length === 0) return b.length === 0 ? 1 : 0;
    if (b.length === 0) return 0;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    // Calculate similarity as a value between 0 and 1
    const maxLength = Math.max(a.length, b.length);
    const levenshteinDistance = matrix[b.length][a.length];
    return (maxLength - levenshteinDistance) / maxLength;
  };

  const playAudio = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: currentLanguage === "english" ? "nova" : "alloy" // Different voices for different languages
        }
      });
      
      if (error) throw error;
      
      const audioContent = data.audioContent;
      const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: t("error"),
        description: t("failedToPlayAudio"),
        variant: "destructive",
      });
    }
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };

  const selectExercise = (exercise: VoiceExercise) => {
    setCurrentExercise(exercise);
    setTranscription("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Practice speaking Spanish with guided exercises. Listen to the prompt, record your response, and get feedback on your pronunciation.`
            : `Practice speaking English with guided exercises. Listen to the prompt, record your response, and get feedback on your pronunciation.`}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={difficulty === "beginner" ? "default" : "outline"}
            onClick={() => setDifficulty("beginner")}
          >
            {t("beginner")}
          </Button>
          <Button 
            variant={difficulty === "intermediate" ? "default" : "outline"}
            onClick={() => setDifficulty("intermediate")}
          >
            {t("intermediate")}
          </Button>
          <Button 
            variant={difficulty === "advanced" ? "default" : "outline"}
            onClick={() => setDifficulty("advanced")}
          >
            {t("advanced")}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{t("exercises")}</h2>
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id}
                className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                  currentExercise?.id === exercise.id ? "border-lingua-primary border-2" : ""
                }`}
                onClick={() => selectExercise(exercise)}
              >
                <h3 className="font-medium">{exercise.title}</h3>
                <p className="text-sm text-gray-600">{exercise.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {currentExercise ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{currentExercise.title}</h2>
              <p className="mb-6">{currentExercise.description}</p>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Volume2 className="h-5 w-5 text-lingua-primary" />
                  <h3 className="font-medium">{t("listenToPrompt")}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => playAudio(currentExercise.audioPrompt)}
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    {t("play")}
                  </Button>
                  <p className="text-gray-700">{currentExercise.audioPrompt}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mic className="h-5 w-5 text-lingua-primary" />
                  <h3 className="font-medium">{t("yourResponse")}</h3>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        {t("stopRecording")}
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        {t("startRecording")}
                      </>
                    )}
                  </Button>
                  
                  {isProcessing && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-lingua-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">{t("processing")}</span>
                    </div>
                  )}
                </div>
                
                {transcription && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1">{t("transcription")}:</p>
                    <p>{transcription}</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-lingua-primary" />
                  <h3 className="font-medium">{t("expectedResponse")}</h3>
                </div>
                <p className="text-gray-700">{currentExercise.expectedResponse}</p>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">{t("selectExercise")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnlimitedVoicePractice;
