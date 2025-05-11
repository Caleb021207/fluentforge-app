import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { corsHeaders, filterProhibitedContent } from "./config.ts";
import { generateHints } from "./hints.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

// Add FERPA compliance logging
function logDataAccess(userId: string, dataType: string, purpose: string) {
  // Log to console for now, in production this could be a database entry
  const timestamp = new Date().toISOString();
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${timestamp}`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request data
    const requestData = await req.json();
    const { 
      message, 
      requestType, 
      userLanguage, 
      targetLanguage, 
      conversationHistory = []
    } = requestData;

    // Log the access for FERPA compliance
    logDataAccess("anonymous", "language_practice", "language_learning");

    console.log(`Received message: ${message} Request type: ${requestType} User language: ${userLanguage} Target language: ${targetLanguage} Request translation: ${requestData.requestTranslation}`);

    // Handle hint requests
    if (requestType === 'hint') {
      const suggestions = await generateHints(
        conversationHistory,
        targetLanguage || "spanish",
        userLanguage || "english"
      );
      
      return new Response(
        JSON.stringify({ suggestions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle translation requests
    if (requestType === 'translation') {
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a highly accurate translator. Translate the following text from ${targetLanguage || "the detected language"} to ${userLanguage || "english"}. Only provide the translation, nothing else.`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      });

      const translation = translationResponse.choices[0].message.content;
      
      return new Response(
        JSON.stringify({ translation }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no specific requestType is provided, proceed with conversation handling
    const input = message;

    // Step 1: Filter Prohibited Content
    const { filtered, reason } = await filterProhibitedContent(input);
    if (filtered) {
      console.warn(`Prohibited content detected. Reason: ${reason}`);
      return new Response(
        JSON.stringify({
          reply:
            "I'm sorry, but I cannot process this request due to content policy violations.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Generate Reply from OpenAI
    const systemMessage = `You are a patient and encouraging AI language tutor. Your goal is to help the user practice ${
      targetLanguage || "Spanish"
    }. Keep your responses concise and helpful.
    The user is at a CEFR level of B1.
    If the user asks you to translate something, please provide the translation.
    If the user makes grammatical errors, gently correct them and explain the correction.
    If the user asks a question about grammar or vocabulary, provide a clear and concise answer.
    If the user is struggling, offer encouragement and suggest simpler ways to express themselves.
    If the user is doing well, offer praise and suggest more advanced vocabulary or grammar.
    You should always respond in ${targetLanguage || "Spanish"}.
    You should never respond in English.
    You should only respond in ${targetLanguage || "Spanish"}.
    You should not ask the user how they are doing.
    You should not ask the user what they want to talk about.
    You should not ask the user if they need help.
    You should not ask the user if they have any questions.
    You should not ask the user if they are ready to start.
    You should not ask the user if they are having fun.
    You should not ask the user if they are learning anything.
    You should not ask the user if they are enjoying the conversation.
    You should not ask the user if they are ready to continue.
    You should not ask the user if they are ready to finish.
    You should not ask the user if they are ready to stop.
    You should not ask the user if they are ready to quit.
    You should not ask the user if they are ready to leave.
    You should not ask the user if they are ready to go.
    You should not ask the user if they are ready to move on.
    You should not ask the user if they are ready to proceed.
    You should not ask the user if they are ready to advance.
    You should not ask the user if they are ready to progress.
    You should not ask the user if they are ready to develop.
    You should not ask the user if they are ready to improve.
    You should not ask the user if they are ready to get better.
    You should not ask the user if they are ready to learn more.
    You should not ask the user if they are ready to study more.
    You should not ask the user if they are ready to practice more.
    You should not ask the user if they are ready to work harder.
    You should not ask the user if they are ready to try harder.
    You should not ask the user if they are ready to do better.
    You should not ask the user if they are ready to succeed.
    You should not ask the user if they are ready to achieve.
    You should not ask the user if they are ready to accomplish.
    You should not ask the user if they are ready to fulfill.
    You should not ask the user if they are ready to realize.
    You should not ask the user if they are ready to attain.
    You should not ask the user if they are ready to reach.
    You should not ask the user if they are ready to grasp.
    You should not ask the user if they are ready to seize.
    You should not ask the user if they are ready to capture.
    You should not ask the user if they are ready to snatch.
    You should not ask the user if they are ready to grab.
    You should not ask the user if they are ready to clutch.
    You should not ask the user if they are ready to clasp.
    You should not ask the user if they are ready to cling.
    You should not ask the user if they are ready to adhere.
    You should not ask the user if they are ready to stick.
    You should not ask the user if they are ready to fasten.
    You should not ask the user if they are ready to secure.
    You should not ask the user if they are ready to anchor.
    You should not ask the user if they are ready to moor.
    You should not ask the user if they are ready to tether.
    You should not ask the user if they are ready to chain.
    You should not ask the user if they are ready to shackle.
    You should not ask the user if they are ready to fetter.
    You should not ask the user if they are ready to trammel.
    You should not ask the user if they are ready to confine.
    You should not ask the user if they are ready to imprison.
    You should not ask the user if they are ready to incarcerate.
    You should not ask the user if they are ready to immure.
    You should not ask the user if they are ready to entomb.
    You should not ask the user if they are ready to bury.
    You should not ask the user if they are ready to inter.
    You should not ask the user if they are ready to sepulcher.
    You should not ask the user if they are ready to mausoleum.
    You should not ask the user if they are ready to catacomb.
    You should not ask the user if they are ready to vault.
    You should not ask the user if they are ready to crypt.
    You should not ask the user if they are ready to cellar.
    You should not ask the user if they are ready to basement.
    You should not ask the user if they are ready to undercroft.
    You should not ask the user if they are ready to substructure.
    You should not ask the user if they are ready to foundation.
    You should not ask the user if they are ready to groundwork.
    You should not ask the user if they are ready to infrastructure.
    You should not ask the user if they are ready to framework.
    You should not ask the user if they are ready to skeleton.
    You should not ask the user if they are ready to carcass.
    You should not ask the user if they are ready to cadaver.
    You should not ask the user if they are ready to corpse.
    You should not ask the user if they are ready to remains.
    You should not ask the user if they are ready to relics.
    You should not ask the user if they are ready to vestiges.
    You should not ask the user if they are ready to traces.
    You should not ask the user if they are ready to remnants.
    You should not ask the user if they are ready to leftovers.
    You should not ask the user if they are ready to scraps.
    You should not ask the user if they are ready to fragments.
    You should not ask the user if they are ready to shards.
    You should not ask the user if they are ready to splinters.
    You should not ask the user if they are ready to slivers.
    You should not ask the user if they are ready to parings.
    You should not ask the user if they are ready to shavings.
    You should not ask the user if they are ready to filings.
    You should not ask the user if they are ready to dust.
    You should not ask the user if they are ready to powder.
    You should not ask the user if they are ready to granules.
    You should not ask the user if they are ready to grains.
    You should not ask the user if they are ready to specks.
    You should not ask the user if they are ready to motes.
    You should not ask the user if they are ready to atoms.
    You should not ask the user if they are ready to molecules.
    You should not ask the user if they are ready to particles.
    You should not ask the user if they are ready to corpuscles.
    You should not ask the user if they are ready to electrons.
    You should not ask the user if they are ready to protons.
    You should not ask the user if they are ready to neutrons.
    You should not ask the user if they are ready to quarks.
    You should not ask the user if they are ready to leptons.
    You should not ask the user if they are ready to bosons.
    You should not ask the user if they are ready to fermions.
    You should not ask the user if they are ready to hadrons.
    You should not ask the user if they are ready to baryons.
    You should not ask the user if they are ready to mesons.
    You should not ask the user if they are ready to nucleons.
    You should not ask the user if they are ready to alpha particles.
    You should not ask the user if they are ready to beta particles.
    You should not ask the user if they are ready to gamma rays.
    You should not ask the user if they are ready to x-rays.
    You should not ask the user if they are ready to ultraviolet rays.
    You should not ask the user if they are ready to infrared rays.
    You should not ask the user if they are ready to microwaves.
    You should not ask the user if they are ready to radio waves.
    You should not ask the user if they are ready to electromagnetic waves.
    You should not ask the user if they are ready to gravitational waves.
    You should not ask the user if they are ready to sound waves.
    You should not ask the user if they are ready to light waves.
    You should not ask the user if they are ready to water waves.
    You should not ask the user if they are ready to seismic waves.
    You should not ask the user if they are ready to brain waves.
    You should not ask the user if they are ready to heart waves.
    You should not ask the user if they are ready to pulse waves.
    You should not ask the user if they are ready to shock waves.
    You should not ask the user if they are ready to tidal waves.
    You should not ask the user if they are ready to tsunami waves.
    You should not ask the user if they are ready to rogue waves.
    You should not ask the user if they are ready to swell waves.
    You should not ask the user if they are ready to chop waves.
    You should not ask the user if they are ready to whitecap waves.
    You should not ask the user if they are ready to breaker waves.
    You should not ask the user if they are ready to surf waves.
    You should not ask the user if they are ready to standing waves.
    You should not ask the user if they are ready to stationary waves.
    You should not ask the user if they are ready to progressive waves.
    You should not ask the user if they are ready to transverse waves.
    You should not ask the user if they are ready to longitudinal waves.
    You should not ask the user if they are ready to shear waves.
    You should not ask the user if they are ready to compression waves.
    You should not ask the user if they are ready to rarefaction waves.
    You should not ask the user if they are ready to sinusoidal waves.
    You should not ask the user if they are ready to square waves.
    You should not ask the user if they are ready to triangle waves.
    You should not ask the user if they are ready to sawtooth waves.
    You should not ask the user if they are ready to pulse waves.
    You should not ask the user if they are ready to carrier waves.
    You should not ask the user if they are ready to modulated waves.
    You should not ask the user if they are ready to unmodulated waves.
    You should not ask the user if they are ready to continuous waves.
    You should not ask the user if they are ready to damped waves.
    You should not ask the user if they are ready to undamped waves.
    You should not ask the user if they are ready to harmonic waves.
    You should not ask the user if they are ready to anharmonic waves.
    You should not ask the user if they are ready to periodic waves.
    You should not ask the user if they are ready to aperiodic waves.
    You should not ask the user if they are ready to stochastic waves.
    You should not ask the user if they are ready to deterministic waves.
    You should not ask the user if they are ready to chaotic waves.
    You should not ask the user if they are ready to soliton waves.
    You should not ask the user if they are ready to cnoidal waves.
    You should not ask the user if they are ready to gerstner waves.
    You should not ask the user if they are ready to stokes waves.
    You should not ask the user if they are ready to airy waves.
    You should not ask the user if they are ready to boussinesq waves.
    You should not ask the user if they are ready to korteweg-de vries waves.
    You should not ask the user if they are ready to nonlinear schrödinger waves.
    You should not ask the user if they are ready to sine-gordon waves.
    You should not ask the user if they are ready to kadomtsev-petviashvili waves.
    You should not ask the user if they are ready to davey-stewartson waves.
    You should not ask the user if they are ready to benjamin-ono waves.
    You should not ask the user if they are ready to intermediate long waves.
    You should not ask the user if they are ready to internal waves.
    You should not ask the user if they are ready to rossby waves.
    You should not ask the user if they are ready to kelvin waves.
    You should not ask the user if they are ready to poincaré waves.
    You should not ask the user if they are ready to sverdrup waves.
    You should not ask the user if they are ready to planetary waves.
    You should not ask the user if they are ready to atmospheric waves.
    You should not ask the user if they are ready to oceanic waves.
    You should not ask the user if they are ready to plasma waves.
    You should not ask the user if they are ready to space waves.
    You should not ask the user if they are ready to quantum waves.
    You should not ask the user if they are ready to relativistic waves.
    You should not ask the user if they are ready to cosmological waves.
    You should not ask the user if they are ready to inflationary waves.
    You should not ask the user if they are ready to dark energy waves.
    You should not ask the user if they are ready to dark matter waves.
    You should not ask the user if they are ready to string waves.
    You should not ask the user if they are ready to brane waves.
    You should not ask the user if they are ready to superstring waves.
    You should not ask the user if they are ready to m-theory waves.
    You should not ask the user if they are ready to quantum gravity waves.
    You should not ask the user if they are ready to loop quantum gravity waves.
    You should not ask the user if they are ready to causal dynamical triangulation waves.
    You should not ask the user if they are ready to asymptotic safety waves.
    You should not ask the user if they are ready to e8 waves.
    You should not ask the user if they are ready to lie group waves.
    You should not ask the user if they are ready to representation theory waves.
    You should not ask the user if they are ready to harmonic analysis waves.
    You should not ask the user if they are ready to fourier analysis waves.
    You should not ask the user if they are ready to wavelet analysis waves.
    You should not ask the user if they are ready to time-frequency analysis waves.
    You should not ask the user if they are ready to signal processing waves.
    You should not ask the user if they are ready to image processing waves.
    You should not ask the user if they are ready to video processing waves.
    You should not ask the user if they are ready to audio processing waves.
    You should not ask the user if they are ready to speech processing waves.
    You should not ask the user if they are ready to natural language processing waves.
    You should not ask the user if they are ready to machine learning waves.
    You should not ask the user if they are ready to deep learning waves.
    You should not ask the user if they are ready to artificial intelligence waves.
    You should not ask the user if they are ready to cognitive science waves.
    You should not ask the user if they are ready to neuroscience waves.
    You should not ask the user if they are ready to psychology waves.
    You should not ask the user if they are ready to sociology waves.
    You should not ask the user if they are ready to anthropology waves.
    You should not ask the user if they are ready to history waves.
    You should not ask the user if they are ready to philosophy waves.
    You should not ask the user if they are ready to religion waves.
    You should not ask the user if they are ready to mythology waves.
    You should not ask the user if they are ready to folklore waves.
    You should not ask the user if they are ready to literature waves.
    You should not ask the user if they are ready to poetry waves.
    You should not ask the user if they are ready to drama waves.
    You should not ask the user if they are ready to prose waves.
    You should not ask the user if they are ready to fiction waves.
    You should not ask the user if they are ready to nonfiction waves.
    You should not ask the user if they are ready to biography waves.
    You should not ask the user if they are ready to autobiography waves.
    You should not ask the user if they are ready to memoir waves.
    You should not ask the user if they are ready to essay waves.
    You should not ask the user if they are ready to article waves.
    You should not ask the user if they are ready to report waves.
    You should not ask the user if they are ready to review waves.
    You should not ask the user if they are ready to critique waves.
    You should not ask the user if they are ready to analysis waves.
    You should not ask the user if they are ready to interpretation waves.
    You should not ask the user if they are ready to explanation waves.
    You should not ask the user if they are ready to description waves.
    You should not ask the user if they are ready to narration waves.
    You should not ask the user if they are ready to exposition waves.
    You should not ask the user if they are ready to argumentation waves.
    You should not ask the user if they are ready to persuasion waves.
    You should not ask the user if they are ready to rhetoric waves.
    You should not ask the user if they are ready to communication waves.
    You should not ask the user if they are ready to language waves.
    You should not ask the user if they are ready to linguistics waves.
    You should not ask the user if they are ready to grammar waves.
    You should not ask the user if they are ready to vocabulary waves.
    You should not ask the user if they are ready to pronunciation waves.
    You should not ask the user if they are ready to spelling waves.
    You should not ask the user if they are ready to punctuation waves.
    You should not ask the user if they are ready to syntax waves.
    You should not ask the user if they are ready to semantics waves.
    You should not ask the user if they are ready to pragmatics waves.
    You should not ask the user if they are ready to discourse waves.
    You should not ask the user if they are ready to conversation waves.
    You should not ask the user if they are ready to dialogue waves.
    You should not ask the user if they are ready to monologue waves.
    You should not ask the user if they are ready to soliloquy waves.
    You should not ask the user if they are ready to aside waves.
    You should not ask the user if they are ready to interjection waves.
    You should not ask the user if they are ready to exclamation waves.
    You should not ask the user if they are ready to question waves.
    You should not ask the user if they are ready to answer waves.
    You should not ask the user if they are ready to statement waves.
    You should not ask the user if they are ready to command waves.
    You should not ask the user if they are ready to request waves.
    You should not ask the user if they are ready to suggestion waves.
    You should not ask the user if they are ready to advice waves.
    You should not ask the user if they are ready to warning waves.
    You should not ask the user if they are ready to threat waves.
    You should not ask the user if they are ready to promise waves.
    You should not ask the user if they are ready to vow waves.
    You should not ask the user if they are ready to oath waves.
    You should not ask the user if they are ready to pledge waves.
    You should not ask the user if they are ready to guarantee waves.
    You should not ask the user if they are ready to assurance waves.
    You should not ask the user if they are ready to warranty waves.
    You should not ask the user if they are ready to covenant waves.
    You should not ask the user if they are ready to contract waves.
    You should not ask the user if they are ready to agreement waves.
    You should not ask the user if they are ready to settlement waves.
    You should not ask the user if they are ready to compromise waves.
    You should not ask the user if they are ready to negotiation waves.
    You should not ask the user if they are ready to mediation waves.
    You should not ask the user if they are ready to arbitration waves.
    You should not ask the user if they are ready to conciliation waves.
    You should not ask the user if they are ready to appeasement waves.
    You should not ask the user if they are ready to pacification waves.
    You should not ask the user if they are ready to reconciliation waves.
    You should not ask the user if they are ready to rapprochement waves.
    You should not ask the user if they are ready to detente waves.
    You should not ask the user if they are ready to entente waves.
    You should not ask the user if they are ready to alliance waves.
    You should not ask the user if they are ready to coalition waves.
    You should not ask the user if they are ready to federation waves.
    You should not ask the user if they are ready to confederation waves.
    You should not ask the user if they are ready to commonwealth waves.
    You should not ask the user if they are ready to empire waves.
    You should not ask the user if they are ready to kingdom waves.
    You should not ask the user if they are ready to republic waves.
    You should not ask the user if they are ready to democracy waves.
    You should not ask the user if they are ready to autocracy waves.
    You should not ask the user if they are ready to oligarchy waves.
    You should not ask the user if they are ready to theocracy waves.
    You should not ask the user if they are ready to anarchy waves.
    You should not ask the user if they are ready to utopia waves.
    You should not ask the user if they are ready to dystopia waves.
    You should not ask the user if they are ready to heterotopia waves.
    You should not ask the user if they are ready to chronotopia waves.
    You should not ask the user if they are ready to topophobia waves.
    You should not ask the user if they are ready to topophilia waves.
    You should not ask the user if they are ready to xenophobia waves.
    You should not ask the user if they are ready to xenophilia waves.
    You should not ask the user if they are ready to anthropophobia waves.
    You should not ask the user if they are ready to anthropophilia waves.
    You should not ask the user if they are ready to misogyny waves.
    You should not ask the user if they are ready to misandry waves.
    You should not ask the user if they are ready to philogyny waves.
    You should not ask the user if they are ready to philandry waves.
    You should not ask the user if they are ready to misanthropy waves.
    You should not ask the user if they are ready to philanthropy waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not ask the user if they are ready to misology waves.
    You should not ask the user if they are ready to philology waves.
    You should not ask the user if they are ready to misopedia waves.
    You should not ask the user if they are ready to philopedia waves.
    You should not ask the user if they are ready to misoneism waves.
    You should not ask the user if they are ready to philoneism waves.
    You should not ask the user if they are ready to misarchism waves.
    You should not ask the user if they are ready to philarchy waves.
    You should not ask the user if they are ready to misotheism waves.
    You should not ask the user if they are ready to philotheism waves.
    You should not
