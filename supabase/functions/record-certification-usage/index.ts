import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, test_type, student_info } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Code is required' }),
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

    // Increment code usage
    const { data: updatedCode, error: updateError } = await supabase
      .from('access_codes')
      .update({ 
        current_uses: supabase.raw('current_uses + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .select()
      .single()

    if (updateError || !updatedCode) {
      console.error('Error updating code usage:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to record usage' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Log the certification attempt for audit purposes
    const logData = {
      code,
      test_type: test_type || 'unknown',
      student_info: student_info || {},
      timestamp: new Date().toISOString(),
      remaining_uses: updatedCode.max_uses ? updatedCode.max_uses - updatedCode.current_uses : null
    }

    console.log('Certification usage recorded:', logData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usage recorded successfully',
        remaining_uses: logData.remaining_uses
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error recording certification usage:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})