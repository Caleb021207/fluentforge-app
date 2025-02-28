
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Configure Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { speakingAttemptId, listeningAttemptId } = await req.json()

    // Validate the parameters
    if (!speakingAttemptId || !listeningAttemptId) {
      return new Response(
        JSON.stringify({ error: 'Speaking and Listening attempt IDs are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the conversation transcript data from the database
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('certification_transcripts')
      .select('*')
      .eq('attempt_id', speakingAttemptId)
      .maybeSingle()

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transcript data' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If no transcript data exists, use mock data for development/demo purposes
    let analysisFeedback
    
    if (!transcriptData || !transcriptData.user_transcripts || transcriptData.user_transcripts.length === 0) {
      console.log('No transcript data found, using mock assessment data for demonstration')
      
      // Generate mock speaking assessment scores
      const speakingScores = {
        pronunciation: Math.floor(Math.random() * 3) + 6, // 6-8 out of 10
        fluency: Math.floor(Math.random() * 3) + 5, // 5-7 out of 10
        grammar: Math.floor(Math.random() * 3) + 6, // 6-8 out of 10
        vocabulary: Math.floor(Math.random() * 4) + 5, // 5-8 out of 10
      }
      
      // Calculate speaking overall score (0-100 scale)
      const speakingOverallScore = Math.round(
        ((speakingScores.pronunciation + speakingScores.fluency + speakingScores.grammar + speakingScores.vocabulary) / 40) * 100
      )
      
      // Generate mock listening assessment scores
      const listeningScores = {
        understanding: Math.floor(Math.random() * 3) + 6, // 6-8 out of 10
        vocabulary: Math.floor(Math.random() * 3) + 6, // 6-8 out of 10
        interaction: Math.floor(Math.random() * 3) + 5, // 5-7 out of 10
      }
      
      // Calculate listening overall score (0-100 scale)
      const listeningOverallScore = Math.round(
        ((listeningScores.understanding + listeningScores.vocabulary + listeningScores.interaction) / 30) * 100
      )
      
      // Mock feedback
      analysisFeedback = {
        speaking: {
          ...speakingScores,
          overallScore: speakingOverallScore,
        },
        listening: {
          ...listeningScores,
          overallScore: listeningOverallScore,
        },
        feedback: "You demonstrated good ability to understand and respond to questions in Spanish. Your pronunciation is generally good, though there are some areas where you could improve your fluency.",
        strengths: [
          "Good vocabulary usage in relevant contexts",
          "Effective at basic conversation structure",
          "Clear pronunciation of most common words"
        ],
        areasToImprove: [
          "Work on more complex grammatical structures",
          "Practice more fluid speech with fewer pauses",
          "Expand vocabulary for more specific topics"
        ]
      }
    } else {
      // TODO: Implement actual analysis of the transcript data
      // For now, we'll use a simplified algorithm that could be enhanced with NLP or AI analysis
      
      // Extract user transcripts and AI responses
      const userTranscripts = transcriptData.user_transcripts || []
      const aiResponses = transcriptData.ai_responses || []
      
      // Analyze conversation quality (this would be replaced by a more sophisticated analysis)
      // Basic metrics:
      // 1. Number of exchanges: More back-and-forth suggests better conversation ability
      // 2. Response length: Longer responses suggest more developed language skills
      // 3. Response time: Quicker responses suggest greater fluency
      // 4. Response relevance: This would require actual NLP analysis
      
      const numExchanges = Math.min(userTranscripts.length, aiResponses.length)
      let totalUserWordCount = 0
      
      for (const transcript of userTranscripts) {
        if (transcript.text) {
          totalUserWordCount += transcript.text.split(' ').length
        }
      }
      
      const avgWordsPerResponse = numExchanges > 0 ? totalUserWordCount / numExchanges : 0
      
      // Determine a very basic score based on quantity of communication
      // In a real implementation, this would be enhanced with quality assessment
      
      // Generate speaking scores
      const pronunciationScore = Math.min(10, Math.max(1, Math.floor(5 + Math.random() * 3)))
      const fluencyScore = Math.min(10, Math.max(1, Math.floor(avgWordsPerResponse / 3)))
      const grammarScore = Math.min(10, Math.max(1, Math.floor(4 + Math.random() * 5)))
      const vocabScore = Math.min(10, Math.max(1, Math.floor(avgWordsPerResponse / 2)))
      
      // Calculate speaking overall score (0-100 scale)
      const speakingOverallScore = Math.round(
        ((pronunciationScore + fluencyScore + grammarScore + vocabScore) / 40) * 100
      )
      
      // Generate listening scores
      const understandingScore = Math.min(10, Math.max(1, Math.floor(numExchanges / 2)))
      const listeningVocabScore = Math.min(10, Math.max(1, Math.floor(5 + Math.random() * 4)))
      const interactionScore = Math.min(10, Math.max(1, Math.floor((numExchanges > 3 ? 7 : 5) + Math.random() * 3)))
      
      // Calculate listening overall score (0-100 scale)
      const listeningOverallScore = Math.round(
        ((understandingScore + listeningVocabScore + interactionScore) / 30) * 100
      )
      
      // Generate feedback based on scores
      const determineFeedback = () => {
        if (speakingOverallScore > 80) {
          return "Your Spanish conversation skills are excellent. You communicate fluently and understand complex exchanges.";
        } else if (speakingOverallScore > 60) {
          return "You demonstrate good conversational Spanish abilities. You can express yourself well and understand most exchanges.";
        } else if (speakingOverallScore > 40) {
          return "You have intermediate conversational Spanish skills. You can handle basic exchanges but sometimes struggle with more complex topics.";
        } else {
          return "You're developing your conversational Spanish skills. Focus on building vocabulary and practicing simple exchanges.";
        }
      }
      
      // Identify strengths
      const strengths = []
      if (pronunciationScore >= 7) strengths.push("Clear pronunciation of Spanish words")
      if (fluencyScore >= 7) strengths.push("Good conversational flow with minimal hesitation")
      if (grammarScore >= 7) strengths.push("Strong grasp of grammatical structures")
      if (vocabScore >= 7) strengths.push("Rich and varied vocabulary usage")
      if (understandingScore >= 7) strengths.push("Excellent comprehension of spoken Spanish")
      if (interactionScore >= 7) strengths.push("Effective at maintaining natural conversation")
      
      // If no strengths were high enough, add a generic one
      if (strengths.length === 0) {
        strengths.push("Willingness to engage in Spanish conversation")
      }
      
      // Identify areas to improve
      const areasToImprove = []
      if (pronunciationScore < 7) areasToImprove.push("Practice pronunciation of difficult Spanish sounds")
      if (fluencyScore < 7) areasToImprove.push("Work on reducing pauses and hesitations when speaking")
      if (grammarScore < 7) areasToImprove.push("Review and practice grammatical structures")
      if (vocabScore < 7) areasToImprove.push("Expand your active vocabulary in everyday topics")
      if (understandingScore < 7) areasToImprove.push("Improve listening skills through more exposure to spoken Spanish")
      if (interactionScore < 7) areasToImprove.push("Practice maintaining conversation with appropriate responses")
      
      // If no areas to improve were low enough, add a generic one
      if (areasToImprove.length === 0) {
        areasToImprove.push("Challenge yourself with more complex conversational topics")
      }
      
      analysisFeedback = {
        speaking: {
          pronunciation: pronunciationScore,
          fluency: fluencyScore,
          grammar: grammarScore,
          vocabulary: vocabScore,
          overallScore: speakingOverallScore,
        },
        listening: {
          understanding: understandingScore,
          vocabulary: listeningVocabScore,
          interaction: interactionScore,
          overallScore: listeningOverallScore,
        },
        feedback: determineFeedback(),
        strengths,
        areasToImprove
      }
    }

    // Store the analysis data for future reference
    if (transcriptData?.id) {
      await supabase
        .from('certification_transcripts')
        .update({ analysis_data: analysisFeedback })
        .eq('id', transcriptData.id)
    }

    return new Response(
      JSON.stringify(analysisFeedback),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
