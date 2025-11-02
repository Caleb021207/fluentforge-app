export interface ConversationStarter {
  targetPhrase: string;
  translations: Record<string, string>;
}

/**
 * Get conversation starter phrases with translations
 * Limited to 5 starters to prevent abuse
 */
export const getConversationStarters = (targetLanguage: string): ConversationStarter[] => {
  const language = targetLanguage.toLowerCase();
  
  // Spanish phrases (5 starters)
  if (language === 'spanish' || language === 'español') {
    return [
      {
        targetPhrase: "Hola, ¿cómo estás hoy?",
        translations: {
          english: "Hello, how are you today?",
          spanish: "Hola, ¿cómo estás hoy?",
          french: "Bonjour, comment allez-vous aujourd'hui?",
          german: "Hallo, wie geht es dir heute?",
          italian: "Ciao, come stai oggi?",
          portuguese: "Olá, como você está hoje?"
        }
      },
      {
        targetPhrase: "¿Qué hiciste el fin de semana pasado?",
        translations: {
          english: "What did you do last weekend?",
          spanish: "¿Qué hiciste el fin de semana pasado?",
          french: "Qu'avez-vous fait le week-end dernier?",
          german: "Was hast du letztes Wochenende gemacht?",
          italian: "Cosa hai fatto lo scorso fine settimana?",
          portuguese: "O que você fez no fim de semana passado?"
        }
      },
      {
        targetPhrase: "¿Puedes recomendar un buen restaurante?",
        translations: {
          english: "Can you recommend a good restaurant?",
          spanish: "¿Puedes recomendar un buen restaurante?",
          french: "Pouvez-vous recommander un bon restaurant?",
          german: "Kannst du ein gutes Restaurant empfehlen?",
          italian: "Puoi consigliare un buon ristorante?",
          portuguese: "Você pode recomendar um bom restaurante?"
        }
      },
      {
        targetPhrase: "Cuéntame sobre tu película favorita",
        translations: {
          english: "Tell me about your favorite movie",
          spanish: "Cuéntame sobre tu película favorita",
          french: "Parlez-moi de votre film préféré",
          german: "Erzähl mir von deinem Lieblingsfilm",
          italian: "Parlami del tuo film preferito",
          portuguese: "Me conte sobre seu filme favorito"
        }
      },
      {
        targetPhrase: "¿Cuáles son tus pasatiempos?",
        translations: {
          english: "What are your hobbies?",
          spanish: "¿Cuáles son tus pasatiempos?",
          french: "Quels sont vos passe-temps?",
          german: "Was sind deine Hobbys?",
          italian: "Quali sono i tuoi hobby?",
          portuguese: "Quais são seus hobbies?"
        }
      }
    ];
  }
  
  // French phrases (5 starters)
  if (language === 'french' || language === 'français') {
    return [
      {
        targetPhrase: "Bonjour, comment allez-vous aujourd'hui?",
        translations: {
          english: "Hello, how are you today?",
          spanish: "Hola, ¿cómo estás hoy?",
          french: "Bonjour, comment allez-vous aujourd'hui?",
          german: "Hallo, wie geht es dir heute?",
          italian: "Ciao, come stai oggi?",
          portuguese: "Olá, como você está hoje?"
        }
      },
      {
        targetPhrase: "Qu'avez-vous fait le week-end dernier?",
        translations: {
          english: "What did you do last weekend?",
          spanish: "¿Qué hiciste el fin de semana pasado?",
          french: "Qu'avez-vous fait le week-end dernier?",
          german: "Was hast du letztes Wochenende gemacht?",
          italian: "Cosa hai fatto lo scorso fine settimana?",
          portuguese: "O que você fez no fim de semana passado?"
        }
      },
      {
        targetPhrase: "Pouvez-vous recommander un bon restaurant?",
        translations: {
          english: "Can you recommend a good restaurant?",
          spanish: "¿Puedes recomendar un buen restaurante?",
          french: "Pouvez-vous recommander un bon restaurant?",
          german: "Kannst du ein gutes Restaurant empfehlen?",
          italian: "Puoi consigliare un buon ristorante?",
          portuguese: "Você pode recomendar um bom restaurante?"
        }
      },
      {
        targetPhrase: "Parlez-moi de votre film préféré",
        translations: {
          english: "Tell me about your favorite movie",
          spanish: "Cuéntame sobre tu película favorita",
          french: "Parlez-moi de votre film préféré",
          german: "Erzähl mir von deinem Lieblingsfilm",
          italian: "Parlami del tuo film preferito",
          portuguese: "Me conte sobre seu filme favorito"
        }
      },
      {
        targetPhrase: "Quels sont vos passe-temps?",
        translations: {
          english: "What are your hobbies?",
          spanish: "¿Cuáles son tus pasatiempos?",
          french: "Quels sont vos passe-temps?",
          german: "Was sind deine Hobbys?",
          italian: "Quali sono i tuoi hobby?",
          portuguese: "Quais são seus hobbies?"
        }
      }
    ];
  }
  
  // Default to English phrases as fallback (5 starters)
  return [
    {
      targetPhrase: "Hello, how are you today?",
      translations: {
        english: "Hello, how are you today?",
        spanish: "Hola, ¿cómo estás hoy?",
        french: "Bonjour, comment allez-vous aujourd'hui?",
        german: "Hallo, wie geht es dir heute?",
        italian: "Ciao, come stai oggi?",
        portuguese: "Olá, como você está hoje?"
      }
    },
    {
      targetPhrase: "What did you do last weekend?",
      translations: {
        english: "What did you do last weekend?",
        spanish: "¿Qué hiciste el fin de semana pasado?",
        french: "Qu'avez-vous fait le week-end dernier?",
        german: "Was hast du letztes Wochenende gemacht?",
        italian: "Cosa hai fatto lo scorso fine settimana?",
        portuguese: "O que você fez no fim de semana passado?"
      }
    },
    {
      targetPhrase: "Can you recommend a good restaurant?",
      translations: {
        english: "Can you recommend a good restaurant?",
        spanish: "¿Puedes recomendar un buen restaurante?",
        french: "Pouvez-vous recommander un bon restaurant?",
        german: "Kannst du ein gutes Restaurant empfehlen?",
        italian: "Puoi consigliare un buon ristorante?",
        portuguese: "Você pode recomendar um bom restaurante?"
      }
    },
    {
      targetPhrase: "Tell me about your favorite movie",
      translations: {
        english: "Tell me about your favorite movie",
        spanish: "Cuéntame sobre tu película favorita",
        french: "Parlez-moi de votre film préféré",
        german: "Erzähl mir von deinem Lieblingsfilm",
        italian: "Parlami del tuo film preferito",
        portuguese: "Me conte sobre seu filme favorito"
      }
    },
    {
      targetPhrase: "What are your hobbies?",
      translations: {
        english: "What are your hobbies?",
        spanish: "¿Cuáles son tus pasatiempos?",
        french: "Quels sont vos passe-temps?",
        german: "Was sind deine Hobbys?",
        italian: "Quali sono i tuoi hobby?",
        portuguese: "Quais são seus hobbies?"
      }
    }
  ];
};
