
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
    const { expectedPhrase, actualPhrase, language = "es", nativeLanguage = "en" } = await req.json();

    if (!expectedPhrase || !actualPhrase) {
      throw new Error("Missing required parameters");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing pronunciation: "${expectedPhrase}" vs "${actualPhrase}"`);

    // Helper function to remove accent marks for basic word matching
    const removeAccents = (str: string): string => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Get basic word matching for context
    const normalizedExpected = removeAccents(expectedPhrase
      .toLowerCase()
      .replace(/[.,!?;:¿¡]/g, '')
      .trim());
      
    const normalizedActual = removeAccents(actualPhrase
      .toLowerCase()
      .replace(/[.,!?;:¿¡]/g, '')
      .trim());

    const expectedWords = normalizedExpected.split(/\s+/);
    const actualWords = normalizedActual.split(/\s+/);

    // Call Lovable AI for intelligent pronunciation analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert pronunciation coach for ${language} language learners whose native language is ${nativeLanguage}. 

Your task is to analyze pronunciation attempts and provide detailed, actionable feedback.

Consider common pronunciation challenges for ${nativeLanguage} speakers learning ${language}, including:
- Phonemes that don't exist in ${nativeLanguage}
- Stress patterns and syllable emphasis differences
- Intonation patterns specific to ${language}
- Common substitution errors

Provide feedback as a JSON object with this EXACT structure:
{
  "wordAnalysis": [
    {
      "word": "<original word from expected phrase>",
      "isCorrect": <true/false>,
      "suggestion": "<specific phonetic tip if incorrect, omit if correct>"
    }
  ],
  "overallFeedback": "<2-3 sentences of encouraging, specific feedback>"
}

NOTE: Do not include an "accuracyScore" field - it will be calculated automatically based on word matching.

Be accurate but encouraging. If they missed a word entirely, mark it incorrect. Focus on the most impactful improvements.`
          },
          {
            role: 'user',
            content: `Expected phrase: "${expectedPhrase}"
Actual pronunciation (transcribed): "${actualPhrase}"

Expected words: ${expectedWords.join(', ')}
Actual words: ${actualWords.join(', ')}

Analyze this pronunciation attempt and provide detailed feedback.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      // Handle rate limit errors gracefully
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service requires payment. Please contact support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response:', aiContent);

    // Parse the AI response
    let analysisResult: PronunciationAnalysisResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      const parsed = JSON.parse(jsonStr);
      
      // Calculate accuracy objectively based on word matching
      const wordAnalysis = parsed.wordAnalysis || [];
      const correctWords = wordAnalysis.filter((w: WordFeedback) => w.isCorrect).length;
      const totalWords = wordAnalysis.length || 1;
      const objectiveAccuracy = Math.round((correctWords / totalWords) * 100);
      
      analysisResult = {
        accuracyScore: objectiveAccuracy,
        wordAnalysis: wordAnalysis,
        overallFeedback: parsed.overallFeedback || 'Keep practicing!',
        complexityScore: parsed.complexityScore,
        phonemeAnalysis: parsed.phonemeAnalysis
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, aiContent);
      // Fallback to basic analysis
      const correctWords = expectedWords.filter(w => actualWords.includes(w)).length;
      const accuracyScore = (correctWords / expectedWords.length) * 100;
      
      analysisResult = {
        accuracyScore,
        wordAnalysis: expectedWords.map(word => ({
          word,
          isCorrect: actualWords.includes(word),
          suggestion: actualWords.includes(word) ? undefined : `Practice: ${word}`
        })),
        overallFeedback: 'AI analysis unavailable. Basic word matching shows ' + 
                        `${Math.round(accuracyScore)}% accuracy.`
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-pronunciation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
