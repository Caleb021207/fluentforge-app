import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationResponse {
  valid: boolean
  message: string
  remaining_uses?: number
  expires_at?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if code exists and is valid
    const { data: codeRecord, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .single()

    if (error || !codeRecord) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid or inactive code' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if code has expired
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code has expired' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if code has remaining uses
    if (codeRecord.max_uses && codeRecord.current_uses >= codeRecord.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code has no remaining uses' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Calculate remaining uses
    const remainingUses = codeRecord.max_uses 
      ? codeRecord.max_uses - codeRecord.current_uses 
      : null

    const response: VerificationResponse = {
      valid: true,
      message: 'Code is valid',
      remaining_uses: remainingUses ?? undefined,
      expires_at: codeRecord.expires_at
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error verifying code:', error)
    return new Response(
      JSON.stringify({ valid: false, message: 'Server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})