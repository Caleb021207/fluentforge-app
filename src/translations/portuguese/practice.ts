
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "Prática",
  practiceWithAI: "Praticar com IA",
  startChatting: "Começar a conversar",
  clearConversation: "Limpar conversa",
  correctGrammar: "Corrigir gramática",
  
  // Chat interface with proper interpolation
  startConversationIn: "Iniciar conversa em {{language}}",
  startTextChatting: "Começar chat de texto",
  
  // Practice guide with proper interpolation
  practiceGuide: "Guia de prática de {{language}}",
  practiceGuideDescription: "Siga essas dicas para tornar sua jornada de aprendizado de {{language}} mais fácil:",
  practiceTip1: "Tente formar frases completas, mesmo que sejam simples.",
  practiceTip2: "Não se preocupe com erros — eles fazem parte do aprendizado!",
  practiceTip3: "Peça explicações se você não entender algo.",
  practiceTip4: "Use palavras que você aprendeu recentemente.",
  practiceTip5: "Nossa IA se adaptará ao seu nível de habilidade e gradualmente o ajudará a melhorar.",
  
  // Chat interface
  typeYourMessageHere: "Digite sua mensagem aqui...",
  typeMessageBelow: "Digite uma mensagem abaixo",
  chatPlaceholder: "Digite sua mensagem para praticar {{targetLanguage}}...",
  practicePrompt: "Olá! Gostaria de praticar conversação em {{targetLanguage}}. Por favor, me ajude corrigindo minha gramática, vocabulário e uso de {{targetLanguage}}. Podemos começar com uma conversa básica?",
  
  // Pronunciation practice
  pronunciationPractice: "Prática de pronúncia",
  improvePronunciationSkillsWith: "Melhore suas habilidades de pronúncia com exercícios direcionados",
  selectComplexityLevel: "Selecionar nível de complexidade",
  chooseDifficultyLevelBasedOn: "Escolha um nível de dificuldade baseado em sua proficiência linguística",
  selectLevelToStart: "Selecione um nível para começar a praticar",
  pronunciationPracticeTips: "Dicas de prática de pronúncia",
  speechRate: "Taxa de fala",
  
  // Pronunciation tips
  listenCarefullyTip: "Ouça atentamente o áudio antes de tentar falar",
  payAttentionToStressTip: "Preste atenção aos padrões de ênfase e entonação",
  practiceDifficultSoundsTip: "Pratique sons difíceis várias vezes",
  recordYourselfTip: "Grave-se e compare com falantes nativos",
  bePatientTip: "Seja paciente - a melhoria da pronúncia leva tempo",
  
  // Pronunciation exercise interface
  practiceExercise: "Exercício de prática",
  topic: "Tópico",
  listenToPhrase: "Ouvir frase",
  playing: "Tocando",
  clickWordToHear: "Clique na palavra para ouvir",
  tryAgain: "Tentar novamente",
  newPhrase: "Nova frase",
  generatingNewPhrase: "Gerando nova frase",
  startExercise: "Começar exercício",
  generatingExercise: "Gerando exercício",
  levelDescription: "Descrição do nível",
  
  // Pronunciation recording and feedback
  yourPronunciation: "Sua pronúncia",
  startRecording: "Começar gravação",
  clickStartToRecord: "Clique para começar a gravar",
  listeningToYou: "Ouvindo você",
  processing: "Processando",
  realTimeTranscription: "Transcrição em tempo real",
  yourTranscription: "Sua transcrição",
  
  // Pronunciation feedback scores
  excellent: "Excelente",
  good: "Bom",
  fair: "Regular",
  needsImprovement: "Precisa melhorar",
  accuracyScore: "Pontuação de precisão",
  intonationScore: "Pontuação de entonação",
  fluencyScore: "Pontuação de fluência",
  complexityScore: "Pontuação de complexidade",
  wordAnalysis: "Análise de palavras",
  phonemeAnalysis: "Análise de fonemas",
  overallFeedback: "Feedback geral",
  
  // Complexity levels
  novice: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  superior: "Superior",
  noviceLevelShortDescription: "Palavras e frases básicas",
  intermediateLevelShortDescription: "Frases simples e conversas",
  advancedLevelShortDescription: "Expressões e ideias complexas",
  superiorLevelShortDescription: "Uso sofisticado da linguagem",
  
  // Voice chat
  startVoiceConversation: "Iniciar conversa por voz",
  endVoiceConversation: "Terminar conversa por voz",
  voiceChatActive: "Chat de voz ativo",
  
  // Progress and analysis
  aiProgressAnalysis: "Análise de progresso IA",
  uploadLanguageTestTranscripts: "Enviar transcrições de teste de idioma",
  totalAnalyses: "Análises totais",
  currentLevel: "Nível atual",
  latestScore: "Pontuação mais recente",
  uploadAndAnalyze: "Enviar e analisar",
  analysisResults: "Resultados da análise",
  progressTimeline: "Linha do tempo do progresso",
  uploadTestTranscript: "Enviar transcrição de teste",
  uploadLanguageTestScoreReport: "Enviar relatório de pontuação de teste de idioma",
  noFileChosen: "Nenhum arquivo escolhido",
  dragDropOrClickToUpload: "Arraste e solte ou clique para enviar",
  supportsFileFormats: "Suporta arquivos JPEG, PNG, WebP e PDF até 10MB",
  selectFile: "Selecionar arquivo",
  whatOurAiCanAnalyze: "O que nossa IA pode analisar:",
  overallScoresAndCefrLevels: "• Pontuações gerais e níveis CEFR",
  individualSkillBreakdowns: "• Detalhamento de habilidades individuais",
  strengthsAndAreasForImprovement: "• Pontos fortes e áreas para melhoria",
  progressTrackingOverTime: "• Acompanhamento do progresso ao longo do tempo",
  
  // Analysis page specific translations
  latestAnalysisResults: "Resultados da Análise Mais Recente",
  detailedAnalysis: "Análise Detalhada",
  analysisBreakdown: "Detalhamento da Análise",
  strengths: "Pontos Fortes",
  areasForImprovement: "Áreas para Melhoria",
  aiRecommendations: "Recomendações da IA",
  analysisHistory: "Histórico de Análises",
  yourPreviousAnalysisResults: "Seus Resultados de Análises Anteriores",
  analysisComplete: "Análise Concluída",
  transcriptAnalyzedSuccessfully: "Sua transcrição foi analisada com sucesso!",
  
  // Hint button interface translations
  responseSuggestions: "Sugestões de Resposta",
  clickPlayToHearPronunciation: "Clique em reproduzir para ouvir a pronúncia",
  startConversationForSuggestions: "Inicie uma conversa para ver sugestões",
  getResponseSuggestions: "Obter sugestões de resposta",
  analyzeConversation: "Analisar Conversa",
  analyzing: "Analisando",
  analysisLimitReached: "Limite de Análise Atingido",
  canOnlyAnalyzeOncePerSession: "Você só pode analisar a conversa uma vez por sessão para evitar farming de XP. Inicie uma nova sessão de prática para analisar novamente.",
  conversationAnalysis: "Análise de Conversa",
  grammarAccuracy: "Precisão Gramatical",
  complexity: "Complexidade",
  
  // Skill names (standardized)
  reading: "Leitura",
  writing: "Escrita",
  speaking: "Fala",
  listening: "Escuta",
  overallLevel: "Nível Geral",
  
  // Practice mode selection
  startPracticing: "Começar a Praticar",
  practiceYourLanguageSkills: "Pratique suas habilidades linguísticas",
  choosePracticeMode: "Escolher Modo de Prática",
  typeAndChat: "Digite e converse com seu tutor de IA",
  speakAndListen: "Fale e ouça em conversas naturais",
  improvePronunciation: "Melhore sua pronúncia com exercícios direcionados"
};

export default practiceTranslations;
