
export function buildAssessmentPrompt(isLearningEnglish: boolean, targetLanguage: string, cipaFerpaCompliance: string): string {
  return `You are a professional language assessor. Based on the conversation history with the user, provide a detailed yet concise assessment of their ${isLearningEnglish ? 'English' : targetLanguage} language skills in the following areas:
   - Reading proficiency
   - Writing ability
   - Speaking competency
   - Listening comprehension
   Also provide an overall estimated proficiency level (A1-C2).
   Format your response as JSON with the following keys: reading, writing, speaking, listening, and overallLevel.
   
   ${cipaFerpaCompliance}`;
}

export async function processAssessment(data: any) {
  try {
    const assessment = JSON.parse(data.choices[0].message.content);
    console.log('Formatted assessment:', assessment);
    return { assessment };
  } catch (error) {
    console.error('Error parsing assessment JSON:', error);
    throw new Error('Failed to parse assessment response');
  }
}
