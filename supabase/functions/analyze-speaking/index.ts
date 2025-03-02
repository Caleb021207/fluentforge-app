
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Access OpenAI API key from environment variables
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") as string;

// Define an interface for the request body
interface AnalysisRequest {
  speakingAttemptId: string;
  listeningAttemptId: string;
  transcript?: {
    userMessages: Array<{
      content: string;
      role: string;
      created_at?: string;
    }>;
    aiResponses: Array<{
      content: string;
      role: string;
      created_at?: string;
    }>;
  };
}

// Define CEFR level score ranges with exponential difficulty scaling
const CEFR_RANGES = {
  A1: { min: 0, max: 30 },     // Beginner
  A2: { min: 31, max: 45 },    // Elementary 
  B1: { min: 46, max: 60 },    // Intermediate
  B2: { min: 61, max: 75 },    // Upper Intermediate
  C1: { min: 76, max: 90 },    // Advanced
  C2: { min: 91, max: 100 }    // Mastery
};

// Define minimum requirements for each CEFR level
const CEFR_REQUIREMENTS = {
  A1: {
    minResponseLength: 2,
    maxComplexity: 1,
    requiredVocabulary: 50,
    grammar: "Simple present tense only"
  },
  A2: {
    minResponseLength: 3,
    maxComplexity: 2,
    requiredVocabulary: 100,
    grammar: "Present and past simple"
  },
  B1: {
    minResponseLength: 5,
    minComplexity: 2,
    requiredVocabulary: 200,
    grammar: "All basic tenses"
  },
  B2: {
    minResponseLength: 7,
    minComplexity: 3,
    requiredVocabulary: 350,
    grammar: "Complex sentences, conditionals"
  },
  C1: {
    minResponseLength: 10,
    minComplexity: 4,
    requiredVocabulary: 500,
    grammar: "Advanced structures, idioms"
  },
  C2: {
    minResponseLength: 12,
    minComplexity: 5,
    requiredVocabulary: 700,
    grammar: "Near-native flexibility"
  }
};

// Define language complexity markers
const COMPLEXITY_MARKERS = {
  basic: ["and", "but", "or", "so", "because"],
  intermediate: ["however", "therefore", "although", "nevertheless", "despite", "furthermore", "moreover"],
  advanced: ["consequently", "subsequently", "notwithstanding", "accordingly", "conversely", "alternatively"]
};

// Fetch the transcript data from the database
async function fetchTranscriptData(requestBody: AnalysisRequest): Promise<any> {
  // If transcript data is included in the request body, use it directly
  if (requestBody.transcript) {
    console.log("Using transcript data from request body");
    return {
      userMessages: requestBody.transcript.userMessages,
      aiResponses: requestBody.transcript.aiResponses
    };
  }

  // Otherwise, try to fetch from the database
  console.log("Fetching transcript data from database for attempt:", requestBody.speakingAttemptId);
  const { data, error } = await supabase
    .from("certification_transcripts")
    .select("user_transcripts, ai_responses")
    .eq("attempt_id", requestBody.speakingAttemptId)
    .limit(1);

  if (error) {
    console.error("Error fetching transcript:", error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("No transcript found for attempt:", requestBody.speakingAttemptId);
    throw new Error("No transcript data found");
  }

  return {
    userMessages: data[0].user_transcripts,
    aiResponses: data[0].ai_responses
  };
}

// Function to format transcript data for analysis
function formatTranscriptForAnalysis(transcript: any): string {
  let formattedText = "Conversation Transcript:\n\n";
  
  // Merge and sort all messages by timestamp if available
  let allMessages = [];
  
  if (transcript.userMessages && Array.isArray(transcript.userMessages)) {
    allMessages = allMessages.concat(
      transcript.userMessages.map((m: any) => ({
        ...m,
        timestamp: m.created_at ? new Date(m.created_at).getTime() : 0
      }))
    );
  }
  
  if (transcript.aiResponses && Array.isArray(transcript.aiResponses)) {
    allMessages = allMessages.concat(
      transcript.aiResponses.map((m: any) => ({
        ...m,
        timestamp: m.created_at ? new Date(m.created_at).getTime() : 0
      }))
    );
  }
  
  // Sort by timestamp if available
  if (allMessages.some(m => m.timestamp > 0)) {
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  // Format the conversation
  allMessages.forEach((message) => {
    if (message.role === "user") {
      formattedText += `User: ${message.content}\n\n`;
    } else if (message.role === "assistant") {
      formattedText += `AI Tutor: ${message.content}\n\n`;
    }
  });
  
  return formattedText;
}

// Pre-process user responses for analysis
function preprocessUserResponses(transcript: any): string[] {
  if (!transcript.userMessages || !Array.isArray(transcript.userMessages)) {
    return [];
  }
  
  return transcript.userMessages
    .filter((m: any) => m.role === "user" && m.content)
    .map((m: any) => m.content.trim());
}

// Calculate response complexity score (1-10)
function calculateComplexity(response: string): number {
  // Split into sentences
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Count words per sentence (average)
  const wordsPerSentence = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
  const avgWordsPerSentence = wordsPerSentence.reduce((sum, count) => sum + count, 0) / 
                             (wordsPerSentence.length || 1);
  
  // Count complexity markers
  const words = response.toLowerCase().split(/\s+/);
  const basicMarkers = words.filter(w => COMPLEXITY_MARKERS.basic.includes(w)).length;
  const intermediateMarkers = words.filter(w => COMPLEXITY_MARKERS.intermediate.includes(w)).length;
  const advancedMarkers = words.filter(w => COMPLEXITY_MARKERS.advanced.includes(w)).length;
  
  // Calculate weighted complexity score
  const complexityScore = (
    (avgWordsPerSentence * 0.4) + 
    (basicMarkers * 0.2) + 
    (intermediateMarkers * 0.6) + 
    (advancedMarkers * 1.0)
  );
  
  // Normalize to 1-10 scale
  return Math.min(10, Math.max(1, Math.round(complexityScore)));
}

// Calculate vocabulary range score (1-10)
function calculateVocabularyRange(responses: string[]): number {
  if (responses.length === 0) return 1;
  
  // Get unique words
  const allWords = responses.join(" ").toLowerCase()
    .replace(/[.,?!;:()"']/g, "")
    .split(/\s+/)
    .filter(w => w.length > 0);
    
  const uniqueWords = new Set(allWords);
  
  // Calculate vocabulary diversity ratio
  const diversity = uniqueWords.size / (allWords.length || 1);
  
  // Calculate average word length (proxy for complexity)
  const avgWordLength = allWords.reduce((sum, word) => sum + word.length, 0) / (allWords.length || 1);
  
  // Normalize to 1-10 scale
  const vocabScore = ((diversity * 5) + (avgWordLength * 0.5)) * 1.2;
  return Math.min(10, Math.max(1, Math.round(vocabScore)));
}

// Calculate grammar accuracy score (1-10) based on patterns
function estimateGrammarAccuracy(responses: string[]): number {
  if (responses.length === 0) return 1;
  
  // Simple heuristics for grammar assessment
  let grammarScore = 5; // Default middle score
  
  // Check for common patterns
  const text = responses.join(" ").toLowerCase();
  
  // Check for verb tense variety
  const pastTense = /(ed|went|came|saw|had|was|were|did|said|made|took)\b/g;
  const futureTense = /\b(will|going to|shall)\b/g;
  const presentPerfect = /\b(have|has)\s+\w+ed\b/g;
  
  const hasPastTense = pastTense.test(text);
  const hasFutureTense = futureTense.test(text);
  const hasPresentPerfect = presentPerfect.test(text);
  
  // Adjust score based on tense variety
  if (hasPastTense) grammarScore += 1;
  if (hasFutureTense) grammarScore += 1;
  if (hasPresentPerfect) grammarScore += 2;
  
  // Check for conditional structures
  const conditionals = /\b(if|unless|provided that|assuming that)\b.*?,.*?\b(would|could|might|will|can)\b/g;
  if (conditionals.test(text)) grammarScore += 2;
  
  // Check for complex sentence structures
  const complexStructures = /\b(although|despite|in spite of|however|nevertheless|whereas|while|even though)\b/g;
  if (complexStructures.test(text)) grammarScore += 2;
  
  // Limit score to 1-10 range
  return Math.min(10, Math.max(1, grammarScore));
}

// Perform detailed transcript analysis and scoring
function analyzeTranscript(transcript: any): any {
  console.log("Performing detailed transcript analysis");
  
  // Extract user responses
  const userResponses = preprocessUserResponses(transcript);
  if (userResponses.length === 0) {
    console.warn("No user responses found in transcript");
    return {
      speaking: {
        level: "A1",
        overallScore: CEFR_RANGES.A1.min,
        pronunciation: 1,
        fluency: 1,
        grammar: 1
      },
      listening: {
        level: "A1",
        overallScore: CEFR_RANGES.A1.min,
        understanding: 1,
        vocabulary: 1,
        interaction: 1
      }
    };
  }
  
  // Analysis metrics
  const responseLengths = userResponses.map(r => r.split(/\s+/).filter(w => w.length > 0).length);
  const avgResponseLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;
  const shortResponses = responseLengths.filter(len => len < 5).length;
  const longResponses = responseLengths.filter(len => len > 10).length;
  const responseRatio = shortResponses / (userResponses.length || 1);
  
  // Calculate individual metrics
  const complexityScores = userResponses.map(calculateComplexity);
  const avgComplexity = complexityScores.reduce((sum, score) => sum + score, 0) / complexityScores.length;
  const vocabularyScore = calculateVocabularyRange(userResponses);
  const grammarScore = estimateGrammarAccuracy(userResponses);
  
  // Assess fluency based on response patterns
  let fluencyScore = 5; // Default middle score
  
  // Adjust fluency based on response patterns
  if (avgResponseLength > 12) fluencyScore += 3;
  else if (avgResponseLength > 8) fluencyScore += 2;
  else if (avgResponseLength > 5) fluencyScore += 1;
  
  if (responseRatio > 0.6) fluencyScore -= 2; // Penalize predominantly short responses
  if (longResponses / (userResponses.length || 1) > 0.3) fluencyScore += 2; // Reward detailed responses
  
  // Estimate pronunciation (this is a rough estimate as we don't have audio)
  // In a real system, this would be measured through audio analysis
  const pronunciationScore = Math.max(3, Math.min(8, Math.round(fluencyScore * 0.8)));
  
  // Calculate interaction quality
  let interactionScore = 5; // Default middle score
  const responsiveness = Math.min(userResponses.length / (transcript.aiResponses?.length || 1), 1);
  interactionScore += Math.round(responsiveness * 3);
  if (avgComplexity > 5) interactionScore += 1;
  
  // Calculate understanding score
  let understandingScore = interactionScore;
  if (vocabularyScore > 5) understandingScore += 1;
  if (grammarScore > 5) understandingScore += 1;
  
  // Normalize all scores to 1-10 range
  fluencyScore = Math.min(10, Math.max(1, Math.round(fluencyScore)));
  pronunciationScore = Math.min(10, Math.max(1, Math.round(pronunciationScore)));
  grammarScore = Math.min(10, Math.max(1, Math.round(grammarScore)));
  vocabularyScore = Math.min(10, Math.max(1, Math.round(vocabularyScore)));
  interactionScore = Math.min(10, Math.max(1, Math.round(interactionScore)));
  understandingScore = Math.min(10, Math.max(1, Math.round(understandingScore)));
  
  // Calculate weighted speaking score (0-100)
  const speakingScore = Math.round(
    (pronunciationScore * 0.30) + 
    (fluencyScore * 0.40) + 
    (grammarScore * 0.30)
  ) * 10;
  
  // Calculate weighted listening score (0-100)
  const listeningScore = Math.round(
    (understandingScore * 0.40) + 
    (vocabularyScore * 0.30) + 
    (interactionScore * 0.30)
  ) * 10;
  
  // Determine CEFR levels
  const speakingLevel = determineCEFRLevel(speakingScore);
  const listeningLevel = determineCEFRLevel(listeningScore);
  
  // Adjust scores based on level requirements
  const adjustedSpeakingScore = applyLevelRequirements(
    speakingScore, 
    speakingLevel, 
    avgResponseLength,
    avgComplexity
  );
  
  const adjustedListeningScore = applyLevelRequirements(
    listeningScore, 
    listeningLevel, 
    avgResponseLength,
    avgComplexity
  );
  
  // Generate feedback
  const strengths = generateStrengths(
    pronunciationScore, 
    fluencyScore, 
    grammarScore, 
    vocabularyScore, 
    interactionScore
  );
  
  const areasToImprove = generateAreasToImprove(
    pronunciationScore, 
    fluencyScore, 
    grammarScore, 
    vocabularyScore, 
    interactionScore
  );
  
  const feedback = generateFeedback(
    speakingLevel, 
    listeningLevel, 
    strengths, 
    areasToImprove
  );
  
  return {
    speaking: {
      level: speakingLevel,
      overallScore: adjustedSpeakingScore,
      pronunciation: pronunciationScore,
      fluency: fluencyScore,
      grammar: grammarScore
    },
    listening: {
      level: listeningLevel,
      overallScore: adjustedListeningScore,
      understanding: understandingScore,
      vocabulary: vocabularyScore,
      interaction: interactionScore
    },
    feedback,
    strengths,
    areasToImprove
  };
}

// Determine CEFR level based on score
function determineCEFRLevel(score: number): string {
  if (score >= CEFR_RANGES.C2.min) return "C2";
  if (score >= CEFR_RANGES.C1.min) return "C1";
  if (score >= CEFR_RANGES.B2.min) return "B2";
  if (score >= CEFR_RANGES.B1.min) return "B1";
  if (score >= CEFR_RANGES.A2.min) return "A2";
  return "A1";
}

// Apply level-specific requirements to adjust scores
function applyLevelRequirements(
  score: number, 
  level: string, 
  avgResponseLength: number,
  avgComplexity: number
): number {
  // Get level requirements
  const requirements = CEFR_REQUIREMENTS[level as keyof typeof CEFR_REQUIREMENTS];
  
  // Apply minimum response length requirement
  if (avgResponseLength < requirements.minResponseLength) {
    // Cap score at the previous level's max
    const prevLevel = getPreviousLevel(level);
    if (prevLevel) {
      const prevRange = CEFR_RANGES[prevLevel as keyof typeof CEFR_RANGES];
      score = Math.min(score, prevRange.max);
    }
  }
  
  // Apply complexity requirements
  if (level !== "A1" && level !== "A2") {
    if (avgComplexity < requirements.minComplexity) {
      // Cap score at the previous level's max
      const prevLevel = getPreviousLevel(level);
      if (prevLevel) {
        const prevRange = CEFR_RANGES[prevLevel as keyof typeof CEFR_RANGES];
        score = Math.min(score, prevRange.max);
      }
    }
  }
  
  // Ensure score is within level range
  const levelRange = CEFR_RANGES[level as keyof typeof CEFR_RANGES];
  return Math.max(levelRange.min, Math.min(levelRange.max, score));
}

// Get previous CEFR level
function getPreviousLevel(level: string): string | null {
  switch (level) {
    case "C2": return "C1";
    case "C1": return "B2";
    case "B2": return "B1";
    case "B1": return "A2";
    case "A2": return "A1";
    default: return null;
  }
}

// Generate strengths based on scores
function generateStrengths(
  pronunciation: number,
  fluency: number,
  grammar: number,
  vocabulary: number,
  interaction: number
): string[] {
  const strengths = [];
  
  if (pronunciation >= 7) strengths.push("Clear pronunciation of most Spanish sounds");
  if (fluency >= 7) strengths.push("Good conversational flow and turn-taking");
  if (grammar >= 7) strengths.push("Accurate use of grammar structures");
  if (vocabulary >= 7) strengths.push("Good range of vocabulary appropriate to the topics");
  if (interaction >= 7) strengths.push("Effective communication of ideas and opinions");
  
  if (pronunciation >= 9) strengths.push("Near-native pronunciation with authentic intonation");
  if (fluency >= 9) strengths.push("Natural and effortless speech with minimal hesitation");
  if (grammar >= 9) strengths.push("Consistent use of complex grammatical structures");
  if (vocabulary >= 9) strengths.push("Rich and varied vocabulary including idiomatic expressions");
  if (interaction >= 9) strengths.push("Sophisticated communication with nuanced expression");
  
  // Ensure we have at least 3 strengths
  if (strengths.length < 3) {
    const defaultStrengths = [
      "Willingness to engage in Spanish conversation",
      "Ability to communicate basic ideas",
      "Participation in the conversation exchange"
    ];
    
    for (const strength of defaultStrengths) {
      if (strengths.length < 3 && !strengths.includes(strength)) {
        strengths.push(strength);
      }
    }
  }
  
  // Limit to at most 5 strengths
  return strengths.slice(0, 5);
}

// Generate areas to improve based on scores
function generateAreasToImprove(
  pronunciation: number,
  fluency: number,
  grammar: number,
  vocabulary: number,
  interaction: number
): string[] {
  const areas = [];
  
  if (pronunciation <= 5) areas.push("Work on pronunciation of specific Spanish sounds");
  if (fluency <= 5) areas.push("Practice speaking more fluently with fewer pauses");
  if (grammar <= 5) areas.push("Improve accuracy of basic grammatical structures");
  if (vocabulary <= 5) areas.push("Expand vocabulary for everyday topics");
  if (interaction <= 5) areas.push("Develop ability to respond more fully to questions");
  
  if (pronunciation <= 3) areas.push("Focus on the basic sounds that differ from English");
  if (fluency <= 3) areas.push("Practice speaking in short, complete sentences");
  if (grammar <= 3) areas.push("Study fundamental verb conjugations and sentence structure");
  if (vocabulary <= 3) areas.push("Learn essential vocabulary for basic communication");
  if (interaction <= 3) areas.push("Practice giving more than one-word responses");
  
  // Ensure we have at least 3 areas to improve
  if (areas.length < 3) {
    const defaultAreas = [
      "Continue practicing to build confidence",
      "Expand vocabulary for more specific topics",
      "Work on more complex grammatical structures"
    ];
    
    for (const area of defaultAreas) {
      if (areas.length < 3 && !areas.includes(area)) {
        areas.push(area);
      }
    }
  }
  
  // Limit to at most 5 areas
  return areas.slice(0, 5);
}

// Generate overall feedback
function generateFeedback(
  speakingLevel: string,
  listeningLevel: string,
  strengths: string[],
  areasToImprove: string[]
): string {
  const levelDescriptions: Record<string, string> = {
    A1: "beginner",
    A2: "elementary",
    B1: "intermediate",
    B2: "upper intermediate",
    C1: "advanced",
    C2: "mastery"
  };
  
  const speakingDesc = levelDescriptions[speakingLevel] || "intermediate";
  const listeningDesc = levelDescriptions[listeningLevel] || "intermediate";
  
  let feedback = `You demonstrated ${speakingDesc} level speaking skills and ${listeningDesc} level listening comprehension in Spanish conversation. `;
  
  if (strengths.length > 0) {
    feedback += `Your strengths include ${strengths[0].toLowerCase()}`;
    if (strengths.length > 1) {
      feedback += ` and ${strengths[1].toLowerCase()}`;
    }
    feedback += ". ";
  }
  
  if (areasToImprove.length > 0) {
    feedback += `To improve, focus on ${areasToImprove[0].toLowerCase()}`;
    if (areasToImprove.length > 1) {
      feedback += ` and ${areasToImprove[1].toLowerCase()}`;
    }
    feedback += ".";
  }
  
  return feedback;
}

// Function to analyze speaking and listening abilities
async function analyzeConversation(transcript: any): Promise<any> {
  const formattedTranscript = formatTranscriptForAnalysis(transcript);
  
  console.log("Formatted transcript prepared for analysis");
  
  // First try the algorithmic analysis
  try {
    const algorithmicAnalysis = analyzeTranscript(transcript);
    console.log("Algorithmic analysis complete:", algorithmicAnalysis);
    return algorithmicAnalysis;
  } catch (algorithmError) {
    console.error("Error in algorithmic analysis, falling back to GPT:", algorithmError);
    
    // If algorithmic analysis fails, fall back to GPT
    return await analyzeWithGPT(formattedTranscript);
  }
}

// Fall back to GPT analysis if needed
async function analyzeWithGPT(formattedTranscript: string): Promise<any> {
  // Create prompt for GPT
  const systemPrompt = `
    You are an expert language examiner for Spanish. You need to evaluate a Spanish conversation between a user (language student) and an AI tutor.
    Assess both the user's speaking and listening abilities based on the transcript.
    
    For speaking evaluation, focus on:
    1. Pronunciation (accuracy, comprehensibility)
    2. Fluency (flow, hesitation, naturalness)
    3. Grammar (accuracy, complexity)
    
    For listening evaluation, focus on:
    1. Understanding (comprehension of AI tutor's questions/statements)
    2. Vocabulary recognition (ability to understand different words/phrases)
    3. Interaction quality (appropriate responses showing comprehension)
    
    Important CEFR level guidelines:
    - A1 (0-30%): Very basic phrases, simple responses
    - A2 (31-45%): Simple sentences about basic needs
    - B1 (46-60%): Connected speech on familiar topics
    - B2 (61-75%): Clear detailed speech on various topics
    - C1 (76-90%): Fluent complex arguments, abstract topics
    - C2 (91-100%): Near-native fluency, nuanced expression
    
    Provide separate CEFR level assessments for both speaking and listening skills.
    For each skill (pronunciation, fluency, etc.), provide a score from 1-10.
    
    Critical requirements by level:
    - For B1 or higher: Responses must average at least 5 words
    - For B2 or higher: Must use complex sentences and good vocabulary range
    - For C1 or higher: Must demonstrate sophisticated language use and nuance
    - For C2: Must show near-native command of language
    
    If these criteria are not met, the assessment must be capped at the appropriate lower level.
  `;
  
  const userPrompt = `
    Please analyze this Spanish conversation transcript and provide a detailed assessment.
    
    ${formattedTranscript}
    
    Format your response strictly as a JSON object with the following structure:
    {
      "speaking": {
        "level": "[CEFR level]",
        "overallScore": [0-100 score],
        "pronunciation": [1-10 score],
        "fluency": [1-10 score],
        "grammar": [1-10 score]
      },
      "listening": {
        "level": "[CEFR level]",
        "overallScore": [0-100 score],
        "understanding": [1-10 score],
        "vocabulary": [1-10 score],
        "interaction": [1-10 score]
      },
      "feedback": "[Overall feedback on the user's performance]",
      "strengths": ["strength1", "strength2", "strength3"],
      "areasToImprove": ["area1", "area2", "area3"]
    }
  `;

  // Call OpenAI API for analysis
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from OpenAI response");
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      console.log("GPT Analysis results:", analysis);
      
      // Ensure overallScore is a number
      if (typeof analysis.speaking.overallScore === 'string') {
        analysis.speaking.overallScore = parseInt(analysis.speaking.overallScore);
      }
      if (typeof analysis.listening.overallScore === 'string') {
        analysis.listening.overallScore = parseInt(analysis.listening.overallScore);
      }
      
      // Apply our level requirements as a safety check
      const speakingLevel = determineCEFRLevel(analysis.speaking.overallScore);
      const listeningLevel = determineCEFRLevel(analysis.listening.overallScore);
      
      analysis.speaking.level = speakingLevel;
      analysis.listening.level = listeningLevel;
      
      return analysis;
    } catch (parseError) {
      console.error("Error parsing analysis results:", parseError);
      console.log("Raw analysis text:", analysisText);
      
      // Provide a default response if parsing fails
      return {
        speaking: {
          level: "B1",
          overallScore: 50,
          pronunciation: 5,
          fluency: 5,
          grammar: 5
        },
        listening: {
          level: "B1",
          overallScore: 50,
          understanding: 5,
          vocabulary: 5,
          interaction: 5
        },
        feedback: "The system could not properly analyze your conversation. Please try again later.",
        strengths: ["Effort to communicate in Spanish"],
        areasToImprove: ["Try again for a more detailed assessment"]
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody: AnalysisRequest = await req.json();
    console.log("Received analysis request:", requestBody);
    
    // Validate request
    if (!requestBody.speakingAttemptId || !requestBody.listeningAttemptId) {
      throw new Error("Missing required parameters: speakingAttemptId and listeningAttemptId");
    }

    // Fetch transcript data
    const transcript = await fetchTranscriptData(requestBody);
    console.log("Transcript data retrieved for analysis");
    
    // Analyze the conversation
    const analysis = await analyzeConversation(transcript);
    console.log("Conversation analysis complete");
    
    // Prepare the response
    const responseObj = {
      success: true,
      ...analysis
    };

    return new Response(JSON.stringify(responseObj), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in analyze-speaking function:", error);
    
    // Return a proper error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
