
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Award, AlertCircle, StopCircle, Send, RefreshCw, CheckCircle2, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { determineLevel } from "./utils/scoreUtils";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TranscriptAssessment, 
  getCEFRColor, 
  getCEFRDescription 
} from "./utils/assessmentUtils";

enum RecordingState {
  IDLE = "idle",
  RECORDING = "recording",
  RECORDED = "recorded",
  PROCESSING = "processing",
  ANALYZING = "analyzing",
  RESULTS = "results",
}

const ConversationalFluencyCertification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [transcript, setTranscript] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [assessment, setAssessment] = useState<TranscriptAssessment | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentPromptRef = useRef<string>("Hola, me gustaría conocerte mejor. Cuéntame sobre tus intereses y aficiones. ¿Qué te gusta hacer en tu tiempo libre?");
  
  const resetTest = () => {
    setError(null);
    setRecordingState(RecordingState.IDLE);
    setTranscript("");
    setAudioBlob(null);
    setAssessment(null);
    audioChunksRef.current = [];
  };

  const startRecording = async () => {
    try {
      setRecordingState(RecordingState.RECORDING);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Convert to base64 for sending to OpenAI Whisper API
        try {
          setRecordingState(RecordingState.PROCESSING);
          const base64Audio = await blobToBase64(audioBlob);
          
          // Trim the data URL prefix to get only the base64 string
          const base64String = base64Audio.split(',')[1];
          
          // Send to Whisper API for transcription
          await transcribeAudio(base64String);
        } catch (err) {
          console.error("Error processing audio:", err);
          setError("Failed to process your speech. Please try again.");
          setRecordingState(RecordingState.IDLE);
        }
      };
      
      mediaRecorder.start();
      toast({
        title: "Recording started",
        description: "Speak clearly in Spanish to respond to the prompt.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Unable to access your microphone. Please check your browser permissions.");
      setRecordingState(RecordingState.IDLE);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording stopped",
        description: "Processing your speech...",
        duration: 3000,
      });
    }
  };
  
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const transcribeAudio = async (base64Audio: string) => {
    try {
      // Call the Supabase Edge Function for transcription
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audio: base64Audio }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.text) {
        setTranscript(data.text);
        setRecordingState(RecordingState.RECORDED);
        toast({
          title: "Transcription complete",
          description: "Your speech has been transcribed successfully.",
          duration: 3000,
        });
      } else {
        throw new Error("No transcription returned");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe your speech. Please try again.");
      setRecordingState(RecordingState.IDLE);
      toast({
        title: "Transcription failed",
        description: "We couldn't process your speech. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleSubmitForAssessment = async () => {
    if (!transcript.trim()) {
      setError("Cannot submit an empty transcript. Please record your speech again.");
      return;
    }
    
    setRecordingState(RecordingState.ANALYZING);
    setError(null);
    
    try {
      toast({
        title: "Analyzing your conversation fluency",
        description: "This may take a moment as our system evaluates your Spanish conversational skills.",
        duration: 5000,
      });
      
      // Send transcript to OpenAI for assessment
      const { data, error } = await supabase.functions.invoke("analyze-transcript", {
        body: { 
          transcript: transcript,
          prompt: currentPromptRef.current 
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        setAssessment(data as TranscriptAssessment);
        setRecordingState(RecordingState.RESULTS);
        
        toast({
          title: "Assessment complete",
          description: `Your CEFR level: ${data.cefrLevel}`,
          duration: 8000,
        });
      } else {
        throw new Error("No assessment data returned");
      }
    } catch (err) {
      console.error("Assessment error:", err);
      setError("Failed to assess your Spanish skills. Please try again.");
      setRecordingState(RecordingState.RECORDED);
      
      toast({
        title: "Assessment failed",
        description: "We couldn't analyze your Spanish skills. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-teal-600" />
          Conversational Fluency Certification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Conversational Fluency Assessment</h3>
            {recordingState !== RecordingState.IDLE && (
              <Button variant="outline" onClick={resetTest}>Cancel Test</Button>
            )}
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please respond to the following prompt in Spanish. This test will evaluate your ability to maintain a natural conversation in Spanish.
                Click "Start Recording" when you're ready, and "Stop Recording" when you're finished.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <p className="font-medium">Prompt:</p>
                <p className="italic">{currentPromptRef.current}</p>
                <p className="text-xs text-gray-500 mt-2">
                  (Hello, I'd like to get to know you better. Tell me about your interests and hobbies. What do you like to do in your free time?)
                </p>
              </div>
              
              <div className="flex justify-center">
                {recordingState === RecordingState.IDLE && (
                  <Button 
                    onClick={startRecording} 
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                )}
                
                {recordingState === RecordingState.RECORDING && (
                  <Button 
                    onClick={stopRecording} 
                    variant="destructive"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
                
                {recordingState === RecordingState.PROCESSING && (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="animate-spin h-5 w-5 text-gray-500" />
                    <span>Transcribing your speech...</span>
                  </div>
                )}
                
                {recordingState === RecordingState.ANALYZING && (
                  <div className="flex flex-col items-center space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5 text-blue-500" />
                      <span>Analyzing your conversational fluency...</span>
                    </div>
                    <Progress className="w-full" value={65} />
                  </div>
                )}
              </div>
              
              {recordingState === RecordingState.RECORDED && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-md border">
                    <p className="font-medium mb-2">Your Response:</p>
                    <p className="text-gray-700">{transcript}</p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setRecordingState(RecordingState.IDLE)}>
                      Record Again
                    </Button>
                    <Button onClick={handleSubmitForAssessment} className="bg-green-600 hover:bg-green-700">
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Assessment
                    </Button>
                  </div>
                </div>
              )}
              
              {recordingState === RecordingState.RESULTS && assessment && (
                <div className="space-y-6 mt-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getCEFRColor(assessment.cefrLevel)}`}>
                      <span className="text-lg font-semibold">CEFR Level: {assessment.cefrLevel}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {getCEFRDescription(assessment.cefrLevel)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          <CheckCircle2 className="h-4 w-4 inline mr-2 text-green-500" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {assessment.strengths.map((strength, index) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          <AlertCircle className="h-4 w-4 inline mr-2 text-amber-500" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {assessment.areasForImprovement.map((area, index) => (
                            <li key={index} className="text-sm">{area}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Conversational Skills Breakdown</h4>
                    <div className="space-y-4">
                      {Object.entries(assessment.assessment).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{key}</span>
                            <span className="text-sm font-medium">{value.score}/10</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={value.score * 10} className="h-2" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{value.comments}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Feedback Summary</h4>
                    <p className="text-sm text-gray-700">{assessment.feedbackSummary}</p>
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <Button onClick={resetTest} variant="outline">
                      Take Another Test
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluencyCertification;
