
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordFeedback {
  word: string;
  isCorrect: boolean;
  suggestion?: string;
}

interface PronunciationAnalysisResult {
  accuracyScore: number;
  wordAnalysis: WordFeedback[];
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expectedPhrase, actualPhrase, language = "es" } = await req.json();

    if (!expectedPhrase || !actualPhrase) {
      throw new Error("Missing required parameters");
    }

    // In a production environment with OpenAI API key, we would use AI for deeper analysis
    // For now, we'll enhance our basic algorithm with more comprehensive metrics
    
    // Normalize both phrases
    const normalizedExpected = expectedPhrase
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .trim();
      
    const normalizedActual = actualPhrase
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .trim();

    // Split into words
    const expectedWords = normalizedExpected.split(/\s+/);
    const actualWords = normalizedActual.split(/\s+/);
    
    // Word-level analysis
    const wordAnalysis = expectedWords.map(expectedWord => {
      // Check if the word or a close match appears in the actual phrase
      const matchFound = actualWords.some(actualWord => 
        actualWord === expectedWord || 
        (actualWord.length > 2 && expectedWord.includes(actualWord)) ||
        (expectedWord.length > 2 && actualWord.includes(expectedWord))
      );
      
      return {
        word: expectedWord,
        isCorrect: matchFound,
        suggestion: matchFound ? undefined : expectedWord
      };
    });
    
    // Calculate overall accuracy score (word-level)
    const correctWords = wordAnalysis.filter(w => w.isCorrect).length;
    const accuracyScore = (correctWords / expectedWords.length) * 100;
    
    // Mock intonation score based on sentence structure
    // In a real implementation, this would use acoustic analysis
    const hasQuestionMark = expectedPhrase.includes('?');
    const actualHasQuestionMark = actualPhrase.includes('?');
    const intonationScore = hasQuestionMark === actualHasQuestionMark ? 
      (Math.random() * 20) + 70 : // Good intonation score (70-90%)
      (Math.random() * 30) + 40;  // Poor intonation (40-70%)
    
    // Mock fluency score based on word count ratio
    // In a real implementation, this would use speech rate and pauses
    const expectedWordCount = expectedWords.length;
    const actualWordCount = actualWords.length;
    const wordCountRatio = Math.min(actualWordCount / expectedWordCount, 1.5);
    const fluencyScore = Math.min(90, (wordCountRatio * 70) + (Math.random() * 20));
    
    // Mock complexity score based on phrase length and word variety
    // In a real implementation, this would analyze grammar structures
    const uniqueWordsRatio = new Set(actualWords).size / actualWords.length;
    const complexityScore = Math.min(95, uniqueWordsRatio * 100);
    
    // Generate mock phoneme analysis (simplified)
    // In a real implementation, this would analyze phonetic pronunciation
    const phonemeAnalysis = [];
    
    // (In a full implementation with AI, we'd do phoneme-level analysis here)
    
    // Generate feedback based on scores
    let overallFeedback = "";
    
    if (accuracyScore >= 80) {
      overallFeedback = "Excellent pronunciation! Your words are clear and mostly accurate.";
      
      if (intonationScore < 70) {
        overallFeedback += " Try to focus on sentence intonation patterns.";
      } else {
        overallFeedback += " Your intonation is natural.";
      }
      
      if (fluencyScore < 70) {
        overallFeedback += " Work on creating a smoother flow between words.";
      }
    } else if (accuracyScore >= 60) {
      overallFeedback = "Good pronunciation. Focus on the highlighted words to improve further.";
      
      if (intonationScore < 70) {
        overallFeedback += " Pay attention to rising and falling tones in questions and statements.";
      }
      
      if (fluencyScore < 60) {
        overallFeedback += " Try practicing at a slower pace to improve accuracy.";
      }
    } else if (accuracyScore >= 40) {
      overallFeedback = "Fair attempt. Try listening to each word carefully before pronouncing them.";
      overallFeedback += " Focus on stressing the correct syllables in longer words.";
      
      if (correctWords / expectedWords.length < 0.5) {
        overallFeedback += " Practice with shorter phrases first.";
      }
    } else {
      overallFeedback = "You need more practice. Try slowing down and focusing on one word at a time.";
      overallFeedback += " Listen carefully to native speakers and imitate their pronunciation.";
    }
    
    // Prepare the response
    const response: PronunciationAnalysisResult = {
      accuracyScore,
      wordAnalysis,
      overallFeedback,
      intonationScore,
      fluencyScore,
      complexityScore,
      // phonemeAnalysis would be included here with AI
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
