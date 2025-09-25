
import OpenAI from "https://esm.sh/openai@4.20.1";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

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

export async function generateHints(
  conversationHistory: { role: string; content: string }[],
  targetLanguage: string = "spanish",
  userLanguage: string = "english"
): Promise<SuggestionCategory[]> {
  try {
    // Default hints in case of failure
    const defaultHints: SuggestionCategory[] = [
      {
        title: "Greetings",
        suggestions: getDefaultHints(targetLanguage, "greetings", userLanguage),
      },
      {
        title: "Questions",
        suggestions: getDefaultHints(targetLanguage, "questions", userLanguage),
      },
      {
        title: "Responses",
        suggestions: getDefaultHints(targetLanguage, "responses", userLanguage),
      },
    ];

    // If there's no conversation history, return default hints
    if (!conversationHistory || conversationHistory.length === 0) {
      return defaultHints;
    }

    // Prepare the conversation context
    const limitedHistory = conversationHistory.slice(-6); // Last 6 messages for context
    
    // Generate dynamic hints based on conversation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a language learning assistant that suggests helpful phrases for the next response. 
          Given a conversation in ${targetLanguage}, generate 3 categories of suggestions with 3-4 phrases each that the user might want to say next.
          The phrases should be appropriate to the conversation context and at a CEFR B1 level.
          
          IMPORTANT: For each phrase, provide BOTH the phrase in ${targetLanguage} AND its translation in ${userLanguage}.
          
          Format your response as JSON with this structure:
          {
            "categories": [
              {
                "title": "Category name in ${userLanguage}",
                "suggestions": [
                  {
                    "phrase": "phrase in ${targetLanguage}",
                    "translation": "translation in ${userLanguage}"
                  },
                  ...
                ]
              },
              ...
            ]
          }
          Make the categories relevant to the conversation. For example: questions, reactions, opinions, requests, etc.`,
        },
        ...limitedHistory.map(msg => ({ 
          role: msg.role as "user" | "assistant" | "system", 
          content: msg.content 
        })),
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content || "{}");
      
      // Validate the structure
      if (
        !content ||
        parsedContent &&
        parsedContent.categories &&
        Array.isArray(parsedContent.categories) &&
        parsedContent.categories.length > 0
      ) {
        return parsedContent.categories;
      }
    } catch (e) {
      console.error("Failed to parse hints response:", e);
    }
    
    // Fallback to default hints on failure
    return defaultHints;
  } catch (error) {
    console.error("Error generating hints:", error);
    
    // Fallback to default hints on error
    return [
      {
        title: "Greetings",
        suggestions: getDefaultHints(targetLanguage, "greetings", userLanguage),
      },
      {
        title: "Questions",
        suggestions: getDefaultHints(targetLanguage, "questions", userLanguage),
      },
      {
        title: "Responses",
        suggestions: getDefaultHints(targetLanguage, "responses", userLanguage),
      },
    ];
  }
}

function getDefaultHints(language: string, category: string, userLanguage: string): SuggestionItem[] {
  const hints = {
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
    portuguese: {
      greetings: [
        { phrase: "Olá!", translation: "Hello!" },
        { phrase: "Bom dia!", translation: "Good morning!" },
        { phrase: "Como está?", translation: "How are you?" },
        { phrase: "Prazer em conhecê-lo", translation: "Nice to meet you" }
      ],
      questions: [
        { phrase: "O que você fez hoje?", translation: "What did you do today?" },
        { phrase: "Pode me ajudar?", translation: "Can you help me?" },
        { phrase: "Como se diz...?", translation: "How do you say...?" },
        { phrase: "O que significa...?", translation: "What does...mean?" }
      ],
      responses: [
        { phrase: "Sim, eu concordo", translation: "Yes, I agree" },
        { phrase: "Eu não entendo", translation: "I don't understand" },
        { phrase: "Pode ser", translation: "It could be" },
        { phrase: "Isso é interessante", translation: "That's interesting" }
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
  
  // Default to Spanish or English if language not found
  const languageHints = hints[language.toLowerCase() as keyof typeof hints] || 
    (language.toLowerCase() === 'english' ? hints.english : hints.spanish);
  
  return languageHints[category as keyof typeof languageHints] || [];
}
