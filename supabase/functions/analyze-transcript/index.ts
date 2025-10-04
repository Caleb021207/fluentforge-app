
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface AnalysisRequest {
  imageData: string;
  fileName: string;
  fileType: string;
}

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILENAME_LENGTH = 255

// Security validation functions
function validateFileName(fileName: string): { valid: boolean; error?: string } {
  if (fileName.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: 'Filename too long' }
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = /[\/\\:*?"<>|]|\.\.\/|^\./
  if (dangerousPatterns.test(fileName)) {
    return { valid: false, error: 'Invalid filename format' }
  }
  
  return { valid: true }
}

function validateFileType(fileType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
    return { 
      valid: false, 
      error: `File type ${fileType} not allowed. Supported types: ${ALLOWED_MIME_TYPES.join(', ')}` 
    }
  }
  return { valid: true }
}

function validateImageData(imageData: string): { valid: boolean; error?: string } {
  // Check if it's a valid data URL
  if (!imageData.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image data format' }
  }
  
  // Estimate file size (base64 is ~33% larger)
  const estimatedSize = imageData.length * 0.75
  if (estimatedSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit' }
  }
  
  return { valid: true }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/^[\.\s]+|[\.\s]+$/g, '')
    .substring(0, MAX_FILENAME_LENGTH)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header and verify user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Extract user from JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Rate limiting check - more reasonable limits for better user experience
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action_type: 'transcript_analysis',
      p_max_requests: 20,  // 20 requests
      p_window_minutes: 60  // per hour
    })

    if (rateLimitError || !rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    const { imageData, fileName, fileType }: AnalysisRequest = await req.json()
    
    // Security validations
    const fileNameValidation = validateFileName(fileName)
    if (!fileNameValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: fileNameValidation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const fileTypeValidation = validateFileType(fileType)
    if (!fileTypeValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: fileTypeValidation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const imageDataValidation = validateImageData(imageData)
    if (!imageDataValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: imageDataValidation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Sanitize filename for logging
    const sanitizedFileName = sanitizeFileName(fileName)
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase Edge Function secrets.')
    }

    console.log(`Analyzing transcript: ${sanitizedFileName} (${fileType}) for user: ${user.id}`)
    
    // Log security event
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'transcript_analysis_request',
        details: {
          fileName: sanitizedFileName,
          fileType,
          timestamp: new Date().toISOString()
        },
        success: true
      })

    const prompt = `Analyze this language learning test transcript/score report. Extract the following information based on our NEW three-section assessment structure:

1. Overall Score (percentage or numerical)
2. CEFR Level (A1, A2, B1, B2, C1, C2)
3. Section scores for our three assessment areas:
   - Reading & Listening Comprehension (combined score)
   - Written Production
   - Spoken Conversational Fluency
4. Test date if visible
5. Test provider/institution
6. Strengths demonstrated
7. Areas needing improvement
8. Specific recommendations for advancement

Please provide a detailed analysis in JSON format with these fields:
- overall_score: number (0-100)
- cefr_level: string
- reading_listening_score: number | null (combined comprehension score)
- written_production_score: number | null
- spoken_fluency_score: number | null
- test_date: string | null (YYYY-MM-DD format)
- test_provider: string | null
- strengths: string[]
- weaknesses: string[]
- recommendations: string[]
- detailed_feedback: string
- progress_insights: string

Focus on actionable insights for language learning progress based on these three core competencies.`

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
    
    // Log security event for error
    try {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const jwt = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(jwt)
        
        if (user) {
          await supabase
            .from('security_audit_log')
            .insert({
              user_id: user.id,
              action: 'transcript_analysis_error',
              details: {
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
              },
              success: false
            })
        }
      }
    } catch (logError) {
      console.error('Error logging security event:', logError)
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during analysis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
