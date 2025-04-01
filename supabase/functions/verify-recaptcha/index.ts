
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY')
    if (!RECAPTCHA_SECRET_KEY) {
      throw new Error('RECAPTCHA_SECRET_KEY is not set')
    }

    const { token } = await req.json()
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "reCAPTCHA token is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    // Verify the token with Google reCAPTCHA API
    const formData = new URLSearchParams()
    formData.append('secret', RECAPTCHA_SECRET_KEY)
    formData.append('response', token)

    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData
    })

    const verificationResult = await verificationResponse.json()
    console.log("reCAPTCHA verification result:", verificationResult)

    // Typically, reject scores below 0.5 as potentially bots
    const isHuman = verificationResult.success && verificationResult.score > 0.5

    return new Response(
      JSON.stringify({ 
        success: isHuman, 
        score: verificationResult.score,
        action: verificationResult.action,
        message: isHuman ? "Verification successful" : "Verification failed, possible bot detected"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
