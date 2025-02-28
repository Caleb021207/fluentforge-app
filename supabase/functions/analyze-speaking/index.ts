
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { userTranscripts, aiResponses } = await req.json()
    
    if (!userTranscripts || !userTranscripts.length) {
      throw new Error('No user transcripts provided')
    }
    
    console.log("Received request with transcripts:", { 
      userTranscriptsCount: userTranscripts.length,
      aiResponsesCount: aiResponses?.length || 0
    })

    // Format the conversation for analysis
    const formattedConversation = formatConversation(userTranscripts, aiResponses)
    
    // Create prompt for GPT
    const prompt = `
You're an expert Spanish language assessor. Analyze the following conversation between a Spanish AI tutor and a student.

CONVERSATION:
${formattedConversation}

Based on the conversation, provide a detailed assessment of the student's Spanish language proficiency. 
Evaluate both speaking and listening abilities separately according to the CEFR framework (A1, A2, B1, B2, C1, or C2).

For SPEAKING assessment, consider:
- Pronunciation and accent
- Fluency and pace
- Grammatical accuracy
- Vocabulary range and appropriateness
- Ability to express ideas
- Complexity of sentence structures used

For LISTENING assessment, consider:
- Comprehension of questions and instructions
- Appropriateness of responses to AI prompts
- Ability to follow the conversation
- Reaction to complex or unexpected topics
- Need for repetition or clarification

Provide the following in your response:
1. A separate CEFR level (A1, A2, B1, B2, C1, or C2) for speaking and listening
2. A separate numerical score (0-100) for both speaking and listening
3. A detailed analysis explaining the assessment (max 400 words)

Format your response exactly as JSON with the following structure:
{
  "speakingLevel": "CEFR_LEVEL",
  "speakingScore": NUMERICAL_SCORE,
  "listeningLevel": "CEFR_LEVEL",
  "listeningScore": NUMERICAL_SCORE,
  "analysis": "DETAILED_ANALYSIS"
}
`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a Spanish language assessment expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        response_format: { type: "json_object" }
      })
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error("OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${errorData}`)
    }

    const openAIData = await openAIResponse.json()
    
    // Extract and parse the assessment JSON
    try {
      const assessmentContent = openAIData.choices[0].message.content
      console.log("OpenAI response:", assessmentContent)
      
      const assessment = JSON.parse(assessmentContent)
      
      // Validate the required fields
      if (!assessment.speakingLevel || !assessment.speakingScore || 
          !assessment.listeningLevel || !assessment.listeningScore) {
        throw new Error("Missing required assessment fields")
      }
      
      return new Response(JSON.stringify(assessment), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (parseError) {
      console.error("Error parsing assessment:", parseError)
      throw new Error("Failed to parse language assessment")
    }
  } catch (error) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to format the conversation
function formatConversation(userTranscripts: string[], aiResponses: string[]): string {
  let formattedConversation = ""
  
  // Determine the max length to iterate through
  const maxLength = Math.max(userTranscripts.length, aiResponses.length)
  
  for (let i = 0; i < maxLength; i++) {
    // Add AI response if available
    if (i < aiResponses.length && aiResponses[i]) {
      formattedConversation += `AI: ${aiResponses[i]}\n\n`
    }
    
    // Add user transcript if available
    if (i < userTranscripts.length && userTranscripts[i]) {
      formattedConversation += `Student: ${userTranscripts[i]}\n\n`
    }
  }
  
  return formattedConversation
}
