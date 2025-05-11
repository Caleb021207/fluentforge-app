
import OpenAI from "https://esm.sh/openai@4.20.1";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
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
        suggestions: getDefaultHints(targetLanguage, "greetings"),
      },
      {
        title: "Questions",
        suggestions: getDefaultHints(targetLanguage, "questions"),
      },
      {
        title: "Responses",
        suggestions: getDefaultHints(targetLanguage, "responses"),
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
          Format your response as JSON with this structure:
          {
            "categories": [
              {
                "title": "Category name in ${userLanguage}",
                "suggestions": ["phrase in ${targetLanguage}", "phrase in ${targetLanguage}", ...]
              },
              ...
            ]
          }
          Make the categories relevant to the conversation. For example: questions, reactions, opinions, requests, etc.`,
        },
        ...limitedHistory,
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Validate the structure
      if (
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
        suggestions: getDefaultHints(targetLanguage, "greetings"),
      },
      {
        title: "Questions",
        suggestions: getDefaultHints(targetLanguage, "questions"),
      },
      {
        title: "Responses",
        suggestions: getDefaultHints(targetLanguage, "responses"),
      },
    ];
  }
}

function getDefaultHints(language: string, category: string): string[] {
  const hints = {
    spanish: {
      greetings: ["¡Hola!", "Buenos días", "¿Cómo estás?", "Encantado de conocerte"],
      questions: ["¿Qué hiciste hoy?", "¿Puedes ayudarme?", "¿Cómo se dice...?", "¿Qué significa...?"],
      responses: ["Sí, estoy de acuerdo", "No entiendo", "Podría ser", "Eso es interesante"],
    },
    french: {
      greetings: ["Bonjour!", "Salut!", "Comment ça va?", "Enchanté"],
      questions: ["Qu'as-tu fait aujourd'hui?", "Peux-tu m'aider?", "Comment dit-on...?", "Que signifie...?"],
      responses: ["Oui, je suis d'accord", "Je ne comprends pas", "C'est possible", "C'est intéressant"],
    },
    portuguese: {
      greetings: ["Olá!", "Bom dia!", "Como está?", "Prazer em conhecê-lo"],
      questions: ["O que você fez hoje?", "Pode me ajudar?", "Como se diz...?", "O que significa...?"],
      responses: ["Sim, eu concordo", "Eu não entendo", "Pode ser", "Isso é interessante"],
    },
    english: {
      greetings: ["Hello!", "Good morning", "How are you?", "Nice to meet you"],
      questions: ["What did you do today?", "Can you help me?", "How do you say...?", "What does...mean?"],
      responses: ["Yes, I agree", "I don't understand", "It could be", "That's interesting"],
    }
  };
  
  // Default to Spanish or English if language not found
  const languageHints = hints[language.toLowerCase() as keyof typeof hints] || 
    (language.toLowerCase() === 'english' ? hints.english : hints.spanish);
  
  return languageHints[category as keyof typeof languageHints] || [];
}
