
import { TranslationRecord } from "../types";
import portugueseCoreTranslations from "./core";
import portuguesePracticeTranslations from "./practice";

// Create voice chat translations for Portuguese
const portugueseVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "Prática gratuita com voz",
  "startSpeaking": "Começar a falar",
  "listeningNow": "Ouvindo agora",
  "youSaid": "Você disse",
  "aiResponse": "Resposta da IA",
  "conversationStarters": "Iniciadores de conversa",
  "tryThesePhrases": "Experimente estas frases para iniciar uma conversa:",
  "practiceWithVoiceChat": "Pratique com chat de voz",
  "useThisTool": "Use esta ferramenta para melhorar suas habilidades de fala e audição. Aqui estão algumas dicas:",
  "askQuestionsAboutTopics": "Faça perguntas sobre tópicos do dia a dia",
  "practiceEverydayPhrases": "Pratique frases e expressões comuns",
  "describeWhatYouSee": "Descreva o que você vê ao seu redor",
  "practiceVocabularyForSpecific": "Pratique vocabulário para tópicos específicos como viagem ou comida",
  "responseSuggestions": "Sugestões de resposta",
  "clickPlayToHear": "Clique em reproduzir para ouvir a pronúncia",
  "startConversationToSee": "Inicie uma conversa para ver sugestões",
  
  // Conversation phrases
  "phrase1": "Olá, como você está hoje?",
  "phrase2": "Como está o tempo onde você está?",
  "phrase3": "Você pode recomendar um bom restaurante?",
  "phrase4": "Quais são seus hobbies e interesses?",
  "phrase5": "Me conte sobre seu livro ou filme favorito.",
  "phrase6": "O que você fez no fim de semana passado?",
  "phrase7": "Quais são seus planos para amanhã?",
  "phrase8": "Como se diz... em inglês?",
  
  // Additional voice chat functionality
  "askQuestions": "Faça perguntas sobre tópicos do dia a dia",
  "practiceCommonPhrases": "Pratique frases e expressões comuns",
  "browserBasedTTS": "Nota: Isso usa síntese de texto para fala baseada no navegador. Para qualidade de voz premium com ElevenLabs, experimente nosso Chat de Voz Premium.",
  "voiceChatEnded": "Chat de voz terminado",
  "remaining": "restante",
  "failedToGetResponse": "Falha ao obter resposta",
  "speechRecognitionError": "Erro de reconhecimento de fala",
  "speechRecognitionNotSupported": "Seu navegador não suporta reconhecimento de fala",
  "microphoneAccessRequired": "Acesso ao microfone necessário",
  "failedToGenerateSpeech": "Falha ao gerar fala",
  "stopListening": "Parar de ouvir"
};

// Complete Portuguese translations with voice chat and practice integration
const portugueseTranslations: TranslationRecord = {
  ...portugueseCoreTranslations,
  ...portugueseVoiceChatTranslations,
  ...portuguesePracticeTranslations
};

export default portugueseTranslations;
