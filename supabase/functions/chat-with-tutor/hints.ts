
import OpenAI from "https://esm.sh/openai@4.20.1";
import { corsHeaders } from "./config.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

// Generate context-aware response suggestions based on conversation history
export async function generateHints(
  conversationHistory: any[],
  targetLanguage: string,
  nativeLanguage: string = "english"
): Promise<SuggestionCategory[]> {
  // Default responses in case of API failure
  const defaultHints: SuggestionCategory[] = [
    {
      title: "Greetings",
      suggestions: [
        "Hola, ¿cómo estás?", 
        "Buenos días", 
        "Me alegro de verte"
      ]
    },
    {
      title: "Questions",
      suggestions: [
        "¿Qué te gusta hacer?", 
        "¿De dónde eres?", 
        "¿Puedes explicar eso otra vez?"
      ]
    },
    {
      title: "Responses",
      suggestions: [
        "Estoy de acuerdo", 
        "No entiendo", 
        "Eso es interesante"
      ]
    }
  ];

  try {
    // Map target language to proper names
    const languageNames: Record<string, string> = {
      spanish: "Spanish",
      french: "French",
      portuguese: "Portuguese",
      english: "English",
    };
    
    const targetLanguageName = languageNames[targetLanguage.toLowerCase()] || targetLanguage;

    // Prepare the system message
    const systemMessage = `You are an AI language tutor helping a ${nativeLanguage} speaker learn ${targetLanguageName}.
    Analyze the conversation history and generate contextually relevant response suggestions for the student to use next.
    Provide 3 categories of suggestions: "Greetings/Acknowledgements", "Questions", and "Responses" with 3-4 suggestions each.
    All suggestions should be in ${targetLanguageName} and should be level-appropriate (intermediate).
    Format your response as a JSON object with the following structure:
    {
      "suggestions": [
        {"title": "category name", "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]},
        {"title": "category name", "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]},
        {"title": "category name", "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}
      ]
    }`;

    // Process conversation history to show just the last 5 messages
    const recentMessages = conversationHistory.slice(-5);
    const messages = [
      { role: "system", content: systemMessage },
      ...recentMessages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      })),
    ];

    // Make the API call
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      console.error("No content in response");
      return defaultHints;
    }
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      if (parsedResponse && parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
        return parsedResponse.suggestions;
      } else {
        console.error("Invalid response format:", parsedResponse);
        return defaultHints;
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return defaultHints;
    }
  } catch (error) {
    console.error("Error generating hints:", error);
    return defaultHints;
  }
}
