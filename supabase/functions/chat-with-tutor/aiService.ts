
import { filterCipaProhibitedContent, containsProhibitedContent } from "./complianceUtils.ts";
import { getLanguagePair, getUserNativeLanguage } from "./languageUtils.ts";

interface AIResponse {
  content: string;
  translation?: string;
}

export async function getAIResponse(
  message: string,
  userLanguage: string,
  openAIApiKey: string,
  systemMessage: string,
  messages: { role: string; content: string }[]
): Promise<AIResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    if (data.error?.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing details.');
    }
    throw new Error(data.error?.message || 'Failed to get response from OpenAI');
  }

  let content = data.choices?.[0]?.message?.content || '';
  let translation = '';

  if (content.includes('\nTranslation:')) {
    [content, translation] = content.split('\nTranslation:');
    content = content.trim();
    translation = translation.trim();
  }

  if (containsProhibitedContent(content)) {
    content = filterCipaProhibitedContent(content);
  }

  if (translation && containsProhibitedContent(translation)) {
    translation = filterCipaProhibitedContent(translation);
  }

  return { content, translation };
}

export function buildTutorInstructions(
  targetLanguage: string,
  nativeLanguage: string,
  cipaFerpaCompliance: string
): string {
  return `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice ${targetLanguage} through natural, realistic conversation. 

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

${cipaFerpaCompliance}

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to an intermediate level.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in the target language (${targetLanguage}) unless the user asks for clarification in their native language (${nativeLanguage}).**
5. **Do NOT use language or expressions beyond an intermediate level.** Simplicity and clarity are more important than accuracy or native-like fluency.

IMPORTANT: ALWAYS provide a translation of your response in the user's native language (${nativeLanguage}).
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.

Keep responses friendly but concise, focused on language learning.
Stay in character as a patient tutor. Don't test the student — just talk with them like a real person. 
You should never converse with the user in a manner that is not appropriate for a k-12 classroom setting.
You should ask questions to continue the conversation if it ever seems to stall.`;
}
