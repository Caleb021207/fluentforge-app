
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";
const MODEL = "google/gemini-2.5-flash";

export interface SuggestionItem {
  phrase: string;
  translation: string;
}

export interface SuggestionCategory {
  title: string;
  suggestions: SuggestionItem[];
}

export interface ConversationHints {
  categories: SuggestionCategory[];
}

async function callLovableAI(messages: {role: string; content: string}[], jsonMode = false): Promise<string> {
  const body: Record<string, unknown> = { model: MODEL, messages, max_tokens: 1200 };
  if (jsonMode) body.response_format = { type: "json_object" };
  
  const resp = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Lovable AI error ${resp.status}: ${text}`);
  }
  
  const data = await resp.json();
  return data.choices[0].message.content || "";
}

export async function generateHints(
  conversationHistory: { role: string; content: string }[],
  targetLanguage: string = "spanish",
  userLanguage: string = "english",
  cefrLevel: string = "B1",
  assignmentTopic: string = ""
): Promise<SuggestionCategory[]> {
  try {
    const normalizedLevel = cefrLevel.toUpperCase().split('/')[0].replace('+', '').trim() || 'B1';
    
    console.log(`[hints] Generating hints: CEFR=${normalizedLevel}, topic="${assignmentTopic.substring(0, 50)}...", lang=${targetLanguage}`);
    
    const defaultHints: SuggestionCategory[] = [
      { title: "Greetings", suggestions: getDefaultHints(targetLanguage, "greetings", userLanguage) },
      { title: "Questions", suggestions: getDefaultHints(targetLanguage, "questions", userLanguage) },
      { title: "Responses", suggestions: getDefaultHints(targetLanguage, "responses", userLanguage) },
    ];

    if (!conversationHistory || conversationHistory.length === 0) {
      return defaultHints;
    }

    const limitedHistory = conversationHistory.slice(-6);
    
    const levelGuidance: Record<string, { complexity: string; examples: string }> = {
      'A1': { complexity: 'VERY SIMPLE: Use only the 300 most common words. Short phrases (3-5 words). Present tense only.', examples: 'Examples: "Hola", "Sí", "No", "Me gusta"' },
      'A2': { complexity: 'SIMPLE: Use the 500 most common words. Short sentences (5-8 words).', examples: 'Examples: "Hoy fui a...", "Me gusta porque..."' },
      'B1': { complexity: 'MODERATE: Use the 1500 most common words. Medium sentences.', examples: 'Examples: "Me gustaría saber...", "Creo que..."' },
      'B2': { complexity: 'INTERMEDIATE: Use broader vocabulary. Complex sentences.', examples: 'Examples: "Si hubiera sabido...", "Me parece interesante que..."' },
      'C1': { complexity: 'ADVANCED: Use sophisticated vocabulary including idioms.', examples: 'Examples: "No cabe duda de que...", "Dicho sea de paso..."' },
      'C2': { complexity: 'NATIVE-LIKE: Use any vocabulary including regional expressions.', examples: 'Examples: Complex idiomatic expressions' }
    };
    
    const currentLevelGuidance = levelGuidance[normalizedLevel] || levelGuidance['B1'];
    const topicInstruction = assignmentTopic ? `The user is working on: "${assignmentTopic}". Generate hints that help them complete this task.` : '';
    
    const systemContent = `You are a language learning assistant that suggests helpful phrases for a student at CEFR ${normalizedLevel} level.

CRITICAL LANGUAGE LEVEL REQUIREMENTS:
${currentLevelGuidance.complexity}
${currentLevelGuidance.examples}

${topicInstruction}

Given the conversation in ${targetLanguage}, generate 3 categories of suggestions with 3-4 phrases each.

REQUIREMENTS:
1. ALL phrases MUST be appropriate for CEFR ${normalizedLevel} level
2. Phrases should be relevant to the conversation
3. For each phrase, provide BOTH the phrase in ${targetLanguage} AND its translation in ${userLanguage}

Format your response as JSON:
{
  "categories": [
    {
      "title": "Category name in ${userLanguage}",
      "suggestions": [
        { "phrase": "phrase in ${targetLanguage}", "translation": "translation in ${userLanguage}" }
      ]
    }
  ]
}`;

    const messages = [
      { role: "system", content: systemContent },
      ...limitedHistory.map(msg => ({ role: msg.role, content: msg.content })),
    ];

    const content = await callLovableAI(messages, true);
    
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent?.categories?.length > 0) {
        console.log(`[hints] Successfully generated ${parsedContent.categories.length} categories`);
        return parsedContent.categories;
      }
    } catch (e) {
      console.error("[hints] Failed to parse hints response:", e);
    }
    
    return defaultHints;
  } catch (error) {
    console.error("[hints] Error generating hints:", error);
    return [
      { title: "Greetings", suggestions: getDefaultHints(targetLanguage, "greetings", userLanguage) },
      { title: "Questions", suggestions: getDefaultHints(targetLanguage, "questions", userLanguage) },
      { title: "Responses", suggestions: getDefaultHints(targetLanguage, "responses", userLanguage) },
    ];
  }
}

function getDefaultHints(language: string, category: string, userLanguage: string): SuggestionItem[] {
  const hints: Record<string, Record<string, SuggestionItem[]>> = {
    spanish: {
      greetings: [
        { phrase: "¡Hola!", translation: "Hello!" },
        { phrase: "Buenos días", translation: "Good morning" },
        { phrase: "¿Cómo estás?", translation: "How are you?" },
        { phrase: "Encantado de conocerte", translation: "Nice to meet you" }
      ],
      questions: [
        { phrase: "¿Qué hiciste hoy?", translation: "What did you do today?" },
        { phrase: "¿Puedes ayudarme?", translation: "Can you help me?" },
        { phrase: "¿Cómo se dice...?", translation: "How do you say...?" },
        { phrase: "¿Qué significa...?", translation: "What does...mean?" }
      ],
      responses: [
        { phrase: "Sí, estoy de acuerdo", translation: "Yes, I agree" },
        { phrase: "No entiendo", translation: "I don't understand" },
        { phrase: "Podría ser", translation: "It could be" },
        { phrase: "Eso es interesante", translation: "That's interesting" }
      ],
    },
    french: {
      greetings: [
        { phrase: "Bonjour!", translation: "Hello!" },
        { phrase: "Salut!", translation: "Hi!" },
        { phrase: "Comment ça va?", translation: "How are you?" },
        { phrase: "Enchanté", translation: "Nice to meet you" }
      ],
      questions: [
        { phrase: "Qu'as-tu fait aujourd'hui?", translation: "What did you do today?" },
        { phrase: "Peux-tu m'aider?", translation: "Can you help me?" },
        { phrase: "Comment dit-on...?", translation: "How do you say...?" },
        { phrase: "Que signifie...?", translation: "What does...mean?" }
      ],
      responses: [
        { phrase: "Oui, je suis d'accord", translation: "Yes, I agree" },
        { phrase: "Je ne comprends pas", translation: "I don't understand" },
        { phrase: "C'est possible", translation: "It's possible" },
        { phrase: "C'est intéressant", translation: "That's interesting" }
      ],
    },
    english: {
      greetings: [
        { phrase: "Hello!", translation: "Hello!" },
        { phrase: "Good morning", translation: "Good morning" },
        { phrase: "How are you?", translation: "How are you?" },
        { phrase: "Nice to meet you", translation: "Nice to meet you" }
      ],
      questions: [
        { phrase: "What did you do today?", translation: "What did you do today?" },
        { phrase: "Can you help me?", translation: "Can you help me?" },
        { phrase: "How do you say...?", translation: "How do you say...?" },
        { phrase: "What does...mean?", translation: "What does...mean?" }
      ],
      responses: [
        { phrase: "Yes, I agree", translation: "Yes, I agree" },
        { phrase: "I don't understand", translation: "I don't understand" },
        { phrase: "It could be", translation: "It could be" },
        { phrase: "That's interesting", translation: "That's interesting" }
      ],
    }
  };
  
  const languageHints = hints[language.toLowerCase()] || hints.spanish;
  return languageHints[category] || [];
}
