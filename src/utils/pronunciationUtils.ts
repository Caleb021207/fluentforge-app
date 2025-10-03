
import { supabase } from "@/integrations/supabase/client";

export interface PronunciationAnalysisResult {
  accuracyScore: number;
  wordAnalysis: {
    word: string;
    isCorrect: boolean;
    suggestion?: string;
  }[];
  overallFeedback: string;
  intonationScore?: number;
  fluencyScore?: number;
  complexityScore?: number;
  phonemeAnalysis?: {
    phoneme: string;
    isCorrect: boolean;
    suggestion?: string;
  }[];
}

/**
 * Transcribes audio using the transcribe-audio edge function with OpenAI Whisper
 */
export async function transcribeAudio(
  audioBase64: string, 
  language: string = "es"
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("transcribe-audio", {
      body: {
        audio: audioBase64,
        language
      }
    });

    if (error) {
      console.error("Error transcribing audio:", error);
      throw new Error(`Transcription failed: ${error.message}`);
    }

    return data?.text || "";
  } catch (error) {
    console.error("Error during transcription:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
}

/**
 * Analyzes pronunciation by comparing expected phrase with actual transcription
 */
export async function analyzePronunciation(
  expectedPhrase: string,
  actualPhrase: string,
  language: string = "es",
  nativeLanguage: string = "en"
): Promise<PronunciationAnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-pronunciation", {
      body: {
        expectedPhrase,
        actualPhrase,
        language,
        nativeLanguage
      }
    });

    if (error) {
      console.error("Error analyzing pronunciation:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    return data as PronunciationAnalysisResult;
  } catch (error) {
    console.error("Error during pronunciation analysis:", error);
    throw new Error("Failed to analyze pronunciation. Please try again.");
  }
}
