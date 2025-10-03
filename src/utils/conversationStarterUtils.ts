/**
 * Get conversation starter phrases in the target language (the language being learned)
 * This ensures learners practice in their target language, not their native language
 */
export const getTargetLanguagePhrases = (targetLanguage: string): string[] => {
  const language = targetLanguage.toLowerCase();
  
  // Spanish phrases
  if (language === 'spanish' || language === 'español') {
    return [
      "Hola, ¿cómo estás hoy?",
      "¿Cómo está el clima donde estás?",
      "¿Puedes recomendar un buen restaurante?",
      "¿Cuáles son tus pasatiempos e intereses?",
      "Cuéntame sobre tu libro o película favorita.",
      "¿Qué hiciste el fin de semana pasado?",
      "¿Cuáles son tus planes para mañana?",
      "¿Cómo se dice... en inglés?"
    ];
  }
  
  // French phrases
  if (language === 'french' || language === 'français') {
    return [
      "Bonjour, comment allez-vous aujourd'hui?",
      "Quel temps fait-il chez vous?",
      "Pouvez-vous recommander un bon restaurant?",
      "Quels sont vos passe-temps et intérêts?",
      "Parlez-moi de votre livre ou film préféré.",
      "Qu'avez-vous fait le week-end dernier?",
      "Quels sont vos projets pour demain?",
      "Comment dit-on... en anglais?"
    ];
  }
  
  // German phrases
  if (language === 'german' || language === 'deutsch') {
    return [
      "Hallo, wie geht es dir heute?",
      "Wie ist das Wetter bei dir?",
      "Kannst du ein gutes Restaurant empfehlen?",
      "Was sind deine Hobbys und Interessen?",
      "Erzähl mir von deinem Lieblingsbuch oder Film.",
      "Was hast du letztes Wochenende gemacht?",
      "Was sind deine Pläne für morgen?",
      "Wie sagt man... auf Englisch?"
    ];
  }
  
  // Italian phrases
  if (language === 'italian' || language === 'italiano') {
    return [
      "Ciao, come stai oggi?",
      "Com'è il tempo da te?",
      "Puoi consigliare un buon ristorante?",
      "Quali sono i tuoi hobby e interessi?",
      "Parlami del tuo libro o film preferito.",
      "Cosa hai fatto lo scorso fine settimana?",
      "Quali sono i tuoi piani per domani?",
      "Come si dice... in inglese?"
    ];
  }
  
  // Portuguese phrases
  if (language === 'portuguese' || language === 'português') {
    return [
      "Olá, como você está hoje?",
      "Como está o tempo aí?",
      "Você pode recomendar um bom restaurante?",
      "Quais são seus hobbies e interesses?",
      "Me conte sobre seu livro ou filme favorito.",
      "O que você fez no fim de semana passado?",
      "Quais são seus planos para amanhã?",
      "Como se diz... em inglês?"
    ];
  }
  
  // Default to English phrases as fallback
  return [
    "Hello, how are you today?",
    "What's the weather like where you are?",
    "Can you recommend a good restaurant?",
    "What are your hobbies and interests?",
    "Tell me about your favorite book or movie.",
    "What did you do last weekend?",
    "What are your plans for tomorrow?",
    "How do you say... in Spanish/English?"
  ];
};
