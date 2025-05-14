
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // In a production environment, we would call OpenAI API here
    // For demonstration, we'll use a basic algorithm to analyze pronunciation
    
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
    
    // Analyze each word
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
    
    // Calculate overall accuracy score
    const correctWords = wordAnalysis.filter(w => w.isCorrect).length;
    const accuracyScore = (correctWords / expectedWords.length) * 100;
    
    // Generate feedback based on score
    let overallFeedback = "";
    
    if (accuracyScore >= 80) {
      overallFeedback = "Excellent pronunciation! Keep practicing to perfect your accent.";
    } else if (accuracyScore >= 60) {
      overallFeedback = "Good pronunciation. Focus on the highlighted words to improve further.";
    } else if (accuracyScore >= 40) {
      overallFeedback = "Fair attempt. Try listening to each word carefully before pronouncing them.";
    } else {
      overallFeedback = "You need more practice. Try slowing down and focusing on one word at a time.";
    }
    
    // Prepare the response
    const response = {
      accuracyScore,
      wordAnalysis,
      overallFeedback,
      expectedPhrase,
      actualPhrase
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
