
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  imageData: string;
  fileName: string;
  fileType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, fileName, fileType }: AnalysisRequest = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase Edge Function secrets.')
    }

    console.log(`Analyzing transcript: ${fileName} (${fileType})`)

    const prompt = `Analyze this language learning test transcript/score report. Extract the following information:

1. Overall Score (percentage or numerical)
2. CEFR Level (A1, A2, B1, B2, C1, C2)
3. Individual skill scores (Reading, Writing, Speaking, Listening) if available
4. Test date if visible
5. Test provider/institution
6. Strengths demonstrated
7. Areas needing improvement
8. Specific recommendations for advancement

Please provide a detailed analysis in JSON format with these fields:
- overall_score: number (0-100)
- cefr_level: string
- reading_score: number | null
- writing_score: number | null
- speaking_score: number | null
- listening_score: number | null
- test_date: string | null (YYYY-MM-DD format)
- test_provider: string | null
- strengths: string[]
- weaknesses: string[]
- recommendations: string[]
- detailed_feedback: string
- progress_insights: string

Focus on actionable insights for language learning progress.`

    console.log('Making request to OpenAI API...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const analysisContent = data.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No analysis content received from OpenAI')
    }

    console.log('Raw analysis received from OpenAI:', analysisContent)

    // Parse the JSON response from GPT
    let parsedAnalysis
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : analysisContent
      parsedAnalysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError)
      console.error('Original content:', analysisContent)
      // Fallback: create a basic analysis structure
      parsedAnalysis = {
        overall_score: null,
        cefr_level: 'Unknown',
        reading_score: null,
        writing_score: null,
        speaking_score: null,
        listening_score: null,
        test_date: null,
        test_provider: null,
        strengths: ['Analysis completed'],
        weaknesses: ['Could not extract detailed metrics'],
        recommendations: ['Please try uploading a clearer image'],
        detailed_feedback: analysisContent,
        progress_insights: 'Analysis completed but detailed extraction failed.'
      }
    }

    console.log('Successfully parsed analysis:', parsedAnalysis)

    return new Response(
      JSON.stringify({
        success: true,
        analysis: parsedAnalysis,
        raw_content: analysisContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in analyze-transcript function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred during analysis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
