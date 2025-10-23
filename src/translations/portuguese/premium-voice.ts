
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Chat de Voz Premium",
  premiumVoiceChatBenefits: "Benefícios de Voz Premium",
  textConversationPractice: "Prática de Conversação de Texto",
  cefrA1Description: "Iniciante - Frases e expressões básicas",
  cefrA2Description: "Elementar - Comunicação cotidiana simples",
  cefrB1Description: "Intermediário - Pode discutir tópicos familiares",
  cefrB2Description: "Intermediário Alto - Pode interagir com fluência",
  beginner: "Iniciante",
  elementary: "Elementar",
  intermediate: "Intermediário",
  upperIntermediate: "Intermediário Alto",
  selectCEFRLevel: "Selecionar Nível CEFR",
  selectedLevel: "Nível Selecionado",
  cooldownPeriodActive: "Limite Semanal Atingido",
  cooldownActive: "Limite Semanal Atingido",
  waitBeforeNextSession: "Você precisa esperar antes de iniciar outra sessão",
  cooldownPeriodDescription: "Você precisa esperar {{time}} antes de iniciar outra sessão de chat de voz premium.",
  resetsAt6AM: "Seu tempo semanal de 10 minutos será reiniciado em {{time}} (Segunda-feira às 6:00 AM)",
  dailyLimitReached: "Você utilizou seus 10 minutos semanais. O tempo será reiniciado na segunda-feira às 6:00 AM.",
  loginRequired: "Login Necessário",
  pleaseLoginToAccessPremiumFeature: "Por favor, faça login para acessar o recurso de chat de voz premium",
  redirectingToLogin: "Redirecionando para a página de login",
  failedToStartSession: "Falha ao iniciar sessão",
  failedToCreateSession: "Falha ao criar sessão",
  loginRequiredDescription: "Para acessar o recurso de chat de voz premium, faça login na sua conta.",
  conversationHistoryCleared: "Histórico de conversação limpo",
  remaining: "restantes esta semana",
  premiumVoiceChatDescription: "Tenha conversas de voz naturais com nosso tutor de IA premium para praticar {{practice}}! A IA ajudará a corrigir sua gramática, vocabulário e pronúncia.",
  premiumVoiceNote: "O uso do chat de voz premium é limitado a uma sessão de 10 minutos por semana",
  premiumVoiceNoteWithReset: "O chat de voz premium permite 10 minutos de tempo de prática semanal. Seu tempo é reiniciado toda segunda-feira às 6:00 AM no horário central.",
  benefitNaturalVoice: "Interações de voz naturais e humanizadas usando a tecnologia ElevenLabs",
  benefitAccentPronunciation: "Sotaque e pronúncia precisos para aprendizado imersivo",
  benefitRegularPractice: "10 minutos de tempo de prática semanal, reiniciando a cada segunda-feira às 6:00 AM no horário central",
  
  // Added voice chat controls
  startVoiceChat: "Iniciar chat de voz",
  stopVoiceChat: "Parar chat de voz",
  voiceChatEnded: "Chat de voz encerrado",
  timeLimit10MinReached: "Limite de tempo de 10 minutos atingido",
  speaking: "Falando...",
  startChatting: "Começar a conversar",
  
  // Added missing key
  premiumSessionLimitReached: "Limite de Sessão Premium Atingido",
  
  // Language-specific advanced voice pages
  spanishAdvancedVoice: "Voz Avançada em Espanhol",
  spanishAdvancedVoiceChat: "Chat de Voz Avançada em Espanhol",
  portugueseAdvancedVoice: "Voz Avançada em Português",
  portugueseAdvancedVoiceChat: "Chat de Voz Avançada em Português",
  advancedVoiceDescription: "Pratique com tecnologia de voz avançada especificamente otimizada para falantes de {{language}}",
  
  // Premium Voice Practice Page
  premiumVoicePractice: "Prática de Voz Premium",
  practiceConversationalEnglish: "Pratique inglês conversacional com GPT-4o Realtime",
  minutesRemainingThisMonth: "{{minutes}} minutos restantes este mês",
  startPremiumSession: "Iniciar Sessão Premium",
  endSession: "Encerrar Sessão",
  poweredByGPT4oRealtime: "Desenvolvido por GPT-4o Realtime",
  conversation: "Conversa",
  you: "Você",
  aiTutor: "Tutor IA",
  minutesLeft: "{{minutes}} minutos restantes",
  connected: "Conectado",
  premiumVoiceReady: "A prática de voz premium está pronta. Comece a falar!",
  limitReached: "Limite Atingido",
  monthlyLimitMessage: "Você usou todos os {{minutes}} minutos deste mês. Reinicia no dia 1.",
  sessionSaved: "Sessão Salva",
  usedMinutesMessage: "Usou {{minutes}} minuto{{plural}} nesta sessão",
  timeWarning: "Aviso de Tempo",
  minutesRemainingWarning: "{{minutes}} minuto{{plural}} restante{{plural}}",
  sessionEnded: "Sessão Encerrada",
  premiumSessionEndedMessage: "Sua sessão premium de 15 minutos terminou",
  premiumVoiceInstructions: "Este recurso foi projetado para conversas fluidas e dinâmicas. Você tem 15 minutos de prática por mês. Simplesmente pressione o botão e diga 'Olá, como você está?' O tutor de IA irá ajudá-lo a praticar suas habilidades de fala em inglês. Se necessário, também pode ajudá-lo em seu idioma nativo.",
  
  // Language support messages
  gptLanguageSupport: "O GPT-4o Realtime suporta mais de 20 idiomas. Embora otimizado para inglês, ele fornece conversas naturais no seu idioma.",
  customLanguageSupport: "O Custom Realtime AI suporta mais de 99 idiomas. Este sistema usa modelos multilíngues especializados, incluindo Whisper (reconhecimento de fala), GPT-4o-mini (conversação) e Azure TTS (síntese de voz).",
  recommendedForYourLanguage: "Recomendado para o seu idioma",
  multilingualSupport: "MULTILÍNGUE",
  customRealtimeDisclaimer: "Cada gravação é limitada a 1 minuto. Após 3 segundos de silêncio, sua mensagem será enviada automaticamente.",
  
  // Voice practice page
  openaiLatestVoiceModel: "Último modelo de voz da OpenAI",
  connecting: "Conectando...",
  startGptSession: "Iniciar Sessão GPT",
  startCustomSession: "Iniciar Sessão Personalizada",
  exchanges: "trocas",
  stateListening: "ouvindo",
  stateProcessing: "processando",
  stateSpeaking: "falando",
  stateIdle: "inativo",
};

export default premiumVoiceTranslations;
