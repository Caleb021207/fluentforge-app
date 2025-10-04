
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

    const prompt = `Analyze this language learning test transcript/score report.

GRADING RUBRIC - Use this to understand their performance level:

Level 1: Novice-Low (Pre-A1, 0-20%)
- Text Type: Words only
- Language Control: Isolated words, unable to connect words for meaning
- Vocabulary: Limited vocabulary dealing with the prompt
- Accuracy: Errors in spelling, word order, usage limit communication

Level 2: Novice-Mid (A1, 21-35%)
- Text Type: Phrases
- Language Control: Single, isolated connections to verbs; inconsistent grammatical connections
- Vocabulary: Limited to everyday Novice-level topics
- Accuracy: Prevalent errors in grammar, word order, word choice limit communication

Level 3: Novice-High (A1+, 36-45%)
- Text Type: Simple Sentences
- Language Control: Can create simple sentences with very basic grammatical control
- Vocabulary: Basic vocabulary with limited elaboration
- Accuracy: Errors sometimes limit communication

Level 4: Intermediate-Low (A2, 46-55%)
- Text Type: Strings of Sentences
- Language Control: Can create simple sentences with some detail
- Vocabulary: Beginning to expand beyond most frequent words
- Accuracy: Errors common but generally don't hinder communication

Level 5: Intermediate-Mid (A2+, 56-65%)
- Text Type: Connected Sentences
- Language Control: Beginning to show connectedness
- Vocabulary: Expanding beyond high-frequency words
- Accuracy: Can use more than present tense but errors occur with other tenses

Level 6: Intermediate-High (B1, 66-75%)
- Text Type: Pre-Paragraph Language
- Language Control: Natural flow using different time frames
- Vocabulary: Uses transition words and circumlocution effectively
- Accuracy: Good control with occasional errors that don't hinder communication

Level 7: Advanced-Low (B2, 76-85%)
- Text Type: Paragraph/Advanced Language
- Language Control: Smooth, natural flow with advanced structures and descriptive language
- Vocabulary: Advanced vocabulary (less frequent, specialized terms)
- Accuracy: Majority of language error-free with smooth flow

Level 8: Advanced-Mid (C1, 86-100%)
- Text Type: Extended Paragraph and Language
- Language Control: Confident, clear organization with native-like flow
- Vocabulary: Concise language across wide variety of topics with cultural understanding
- Accuracy: Almost entirely error-free with smooth, natural flow

PLATFORM PRACTICE MODES - Recommend these based on weaknesses:

1. TEXT PRACTICE (/practice)
   - Interactive chat with AI tutor at any CEFR level (A1-C2)
   - Toggle real-time translations on/off to see Spanish↔English
   - AI provides targeted grammar/vocabulary drills during natural conversation
   - Students can ask for specific exercises (e.g., "Give me 10 fill-in-the-blank for past tense")
   - Best for: grammar accuracy, vocabulary building, written production, reading comprehension, sentence structure

2. VOICE PRACTICE (/voice-chat)
   - Speak naturally and AI responds with speech
   - Real-time conversation at selected CEFR level
   - Develops both speaking and listening simultaneously
   - Best for: spoken fluency, listening comprehension, pronunciation in context, conversational flow, confidence building

3. PRONUNCIATION PRACTICE (/pronunciation-practice)
   - Listen to individual words/phrases with translations
   - Repeat and get instant feedback on accuracy
   - Focus on specific sounds and word-level clarity
   - Best for: phonetic accuracy, accent reduction, word-level pronunciation, difficult sounds

Extract the following information:
1. Overall Score (percentage)
2. CEFR Level (A1, A2, B1, B2, C1, C2)
3. Section scores:
   - Reading & Listening Comprehension (combined score)
   - Written Production
   - Spoken Conversational Fluency
4. Test date if visible
5. Test provider/institution
6. Strengths demonstrated
7. Areas needing improvement (weaknesses)
8. PLATFORM-SPECIFIC RECOMMENDATIONS (3-5 recommendations)

Return JSON with this exact structure:
{
  "overall_score": number (0-100),
  "cefr_level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "reading_listening_score": number | null,
  "written_production_score": number | null,
  "spoken_fluency_score": number | null,
  "test_date": string | null,
  "test_provider": string | null,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "detailed_feedback": string,
  "progress_insights": string
}

CRITICAL RULES FOR RECOMMENDATIONS:
- Generate 3-5 specific, actionable recommendations
- Each recommendation MUST:
  * Start with a clear action: "Use [Practice Mode] at [Level]..."
  * Reference a specific weakness from the transcript analysis
  * Explain the concrete exercise or focus area
  * Mention why this practice mode addresses that weakness
- Match the practice mode to their specific weakness:
  * Grammar issues, vocabulary gaps, writing problems → TEXT PRACTICE
  * Speaking confidence, conversational flow, listening → VOICE PRACTICE
  * Pronunciation errors, accent issues, unclear sounds → PRONUNCIATION PRACTICE
- Order by priority (most critical weaknesses first)
- Keep each recommendation 2-3 sentences maximum
- Each recommendation is a plain string, NOT a JSON object

EXAMPLE GOOD RECOMMENDATIONS:
"Use Text Practice at A1 level to improve subject-verb agreement. Ask the AI tutor for 10 fill-in-the-blank exercises focusing on present tense conjugations. Start with translations enabled, then retry without them to reinforce learning."

"Use Voice Practice at A2 level to build conversational fluency. Practice 3-5 short conversations about daily routines and hobbies to improve your ability to speak in connected sentences rather than isolated phrases."

"Use Pronunciation Practice at A1 level to work on word-level clarity. Focus on 20 high-frequency verbs per session, listening carefully to vowel sounds and repeating until you achieve clear pronunciation."

Focus on actionable insights that directly address the identified weaknesses using our platform's practice modes.`

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

    // Validate and sanitize recommendations (convert to strings if needed)
    if (parsedAnalysis.recommendations && Array.isArray(parsedAnalysis.recommendations)) {
      parsedAnalysis.recommendations = parsedAnalysis.recommendations
        .slice(0, 10)
        .map((rec: any) => {
          // If it's already a string, use it
          if (typeof rec === 'string') {
            return rec.slice(0, 500);
          }
          // If it's an object with recommendation_text, extract that
          if (rec.recommendation_text) {
            return String(rec.recommendation_text).slice(0, 500);
          }
          // Fallback: stringify the object
          return String(rec).slice(0, 500);
        });
    } else {
      parsedAnalysis.recommendations = [];
    }

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
