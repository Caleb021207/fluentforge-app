
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Witamy w nauce języków",
  yourPersonalAICompanion: "Twój osobisty partner AI do nauki języków",
  startPracticing: "Rozpocznij ćwiczenia",
  practiceYourLanguageSkills: "Ćwicz swoje umiejętności językowe",
  swipeUpToGetStarted: "Przesuń w górę, aby rozpocząć",
  getStarted: "Rozpocznij",
  selectYourLanguagePreferences: "Wybierz swoje preferencje językowe",

  // Language selection
  selectNativeLanguage: "Wybierz swój język ojczysty",
  iSpeak: "Mówię w",
  saveLanguagePreferences: "Zapisz preferencje językowe",

  // Auth
  signIn: "Zaloguj się",
  signUp: "Zarejestruj się",
  signInToContinue: "Zaloguj się, aby kontynuować",
  createAccountToGetStarted: "Utwórz konto, aby rozpocząć",
  email: "Email",
  password: "Hasło",
  accessPasscode: "Kod dostępu",
  dontHaveAccount: "Nie masz konta?",
  alreadyHaveAccount: "Masz już konto?",

  // Header
  loggedInAs: "Zalogowano jako",
  signedInAs: "Zalogowano jako",
  logout: "Wyloguj się",
  lightMode: "Tryb jasny",

  // Navigation
  home: "Strona główna",
  practice: "Ćwiczenia",
  textPractice: "Ćwiczenia tekstowe",
  unlimitedVoicePracticeNav: "Nieograniczona praktyka mowy",
  pronunciationPracticeNav: "Ćwiczenia wymowy",
  aiAnalysis: "Analiza AI",
  profile: "Profil",
  settings: "Ustawienia",

  // Practice page
  englishPractice: "Ćwiczenia z angielskiego",
  startChatting: "Rozpocznij rozmowę",
  startConversationIn: "Rozpocznij rozmowę po {{language}}",
  fixGrammar: "Popraw gramatykę",
  correctGrammar: "Popraw gramatykę",
  clearConversation: "Wyczyść rozmowę",
  startTextChat: "Rozpocznij czat tekstowy",
  startTextChatting: "Rozpocznij czat tekstowy",
  typeMessageBelow: "Wpisz wiadomość poniżej",
  typeMessageToPractice: "Wpisz wiadomość, aby ćwiczyć {{language}}...",
  send: "Wyślij",

  // Practice Guide
  practiceGuide: "Przewodnik po ćwiczeniach {{language}}",
  practiceGuideTitle: "Przewodnik po ćwiczeniach {{language}}",
  practiceGuideDescription: "Kilka pomocnych wskazówek do efektywnych ćwiczeń {{language}}:",
  practiceGuideIntro: "Kilka pomocnych wskazówek do efektywnych ćwiczeń {{language}}:",
  practiceGuideTip1: "Staraj się tworzyć pełne zdania, nawet jeśli są proste.",
  practiceGuideTip2: "Nie martw się błędami — są częścią nauki!",
  practiceGuideTip3: "Poproś o wyjaśnienie, jeśli czegoś nie rozumiesz.",
  practiceGuideTip4: "Używaj słów, których ostatnio się nauczyłeś.",
  practiceGuideTip5: "Nasza AI dostosuje się do twojego poziomu umiejętności.",

  // Practice tips - using t() keys
  practiceTip1: "Staraj się tworzyć pełne zdania, nawet jeśli są proste.",
  practiceTip2: "Nie martw się błędami — są częścią nauki!",
  practiceTip3: "Poproś o wyjaśnienie, jeśli czegoś nie rozumiesz.",
  practiceTip4: "Używaj słów, których ostatnio się nauczyłeś.",
  practiceTip5: "Nasza AI dostosuje się do twojego poziomu umiejętności.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Staraj się tworzyć pełne zdania, nawet jeśli są proste.",
  "Don't worry about mistakes — they're part of learning!": "Nie martw się błędami — są częścią nauki!",
  "Ask for explanations if there's something you don't understand.": "Poproś o wyjaśnienie, jeśli czegoś nie rozumiesz.",
  "Use words you've learned recently.": "Używaj słów, których ostatnio się nauczyłeś.",
  "Our AI will adapt to your skill level and gradually help you improve.": "Nasza AI dostosuje się do twojego poziomu umiejętności i stopniowo pomoże ci się poprawić.",
  "Here are some tips to get the most out of your {{language}} practice:": "Oto kilka wskazówek, jak w pełni wykorzystać ćwiczenia {{language}}:",

  // Hint button
  suggestionResponses: "Sugestie odpowiedzi",
  responseSuggestions: "Sugestie odpowiedzi",
  clickPlayToHearPronunciation: "Kliknij odtwórz, aby usłyszeć wymowę",
  startConversationForSuggestions: "Rozpocznij rozmowę, aby zobaczyć sugestie",
  startConversationToSeeSuggestions: "Rozpocznij rozmowę, aby zobaczyć sugestie",
  getResponseSuggestions: "Uzyskaj sugestie odpowiedzi",
  greetings: "Powitania",
  questions: "Pytania",
  error: "Błąd",
  couldNotGenerateHints: "Nie udało się wygenerować wskazówek",
  failedToPlayAudio: "Nie udało się odtworzyć dźwięku",
  play: "Odtwórz",

  // Voice chat
  unlimitedVoicePractice: "Nieograniczona praktyka mowy",
  practiceDescription: "Opis ćwiczenia",
  aiModelInfo: "Informacje o modelu AI: OpenAI GPT-4o-mini do rozumienia i generowania języka naturalnego, przeglądarkowy TTS do odpowiedzi głosowych.",
  practiceLevel: "Poziom ćwiczenia",
  intermediatePracticeLevel: "Średnio zaawansowany — może omawiać znane tematy",
  "Intermediate - Can discuss familiar topics": "Średnio zaawansowany — może omawiać znane tematy",

  // CEFR Level Descriptions
  cefrB1Description: "Średnio zaawansowany — może omawiać znane tematy",
  cefrA1Description: "Początkujący — podstawowe zdania i wyrażenia",
  cefrA2Description: "Podstawowy — proste codzienne rozmowy",
  cefrB2Description: "Wyższy średnio zaawansowany — może łatwo się komunikować",

  currentLanguage: "Aktualny język",
  practiceLanguage: "Język ćwiczeń",
  startSpeaking: "Rozpocznij mówienie",
  stopListening: "Przestań słuchać",
  listeningNow: "Teraz słucham",
  youSaid: "Powiedziałeś",
  conversationStarters: "Początki rozmów",
  howToStartConversation: "Jak rozpocząć rozmowę",
  tryThesePhrases: "Spróbuj tych zwrotów:",
  conversationStarter1: "Cześć! Jak się masz dzisiaj?",
  conversationStarter2: "Jaka jest pogoda tam, gdzie jesteś?",
  conversationStarter3: "Czy możesz polecić dobrą restaurację?",
  conversationStarter4: "Jakie są twoje hobby i zainteresowania?",
  conversationStarter5: "Opowiedz mi o swojej ulubionej książce lub filmie.",
  conversationStarter6: "Co robiłeś w ostatni weekend?",
  conversationStarter7: "Jakie masz plany na jutro?",
  conversationStarter8: "Jak się mówi... po hiszpańsku/angielsku?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Cześć, jak się masz dzisiaj?",
  "What's the weather like where you are?": "Jaka jest pogoda tam, gdzie jesteś?",
  "Can you recommend a good restaurant?": "Czy możesz polecić dobrą restaurację?",
  "What are your hobbies and interests?": "Jakie są twoje hobby i zainteresowania?",
  "Tell me about your favorite book or movie.": "Opowiedz mi o swojej ulubionej książce lub filmie.",
  "What did you do last weekend?": "Co robiłeś w ostatni weekend?",
  "What are your plans for tomorrow?": "Jakie masz plany na jutro?",
  "How do you say... in Spanish/English?": "Jak się mówi... po hiszpańsku/angielsku?",

  practiceWithVoiceChat: "Ćwicz z czatem głosowym",
  voiceChatTips: "Użyj tego narzędzia, aby poprawić swoje umiejętności mówienia i słuchania. Oto kilka wskazówek:",
  voiceTip1: "Zadawaj pytania o codzienne tematy",
  voiceTip2: "Ćwicz popularne zwroty i wyrażenia",
  voiceTip3: "Opisuj to, co widzisz wokół siebie",
  voiceTip4: "Ćwicz słownictwo z konkretnych tematów, takich jak podróże czy jedzenie",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Użyj tego narzędzia, aby poprawić swoje umiejętności mówienia i słuchania. Oto kilka wskazówek:",
  "Ask questions about everyday topics": "Zadawaj pytania o codzienne tematy",
  "Practice common phrases and expressions": "Ćwicz popularne zwroty i wyrażenia",
  "Describe what you see around you": "Opisuj to, co widzisz wokół siebie",
  "Practice vocabulary for specific topics like travel or food": "Ćwicz słownictwo z konkretnych tematów, takich jak podróże czy jedzenie",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Rozpocznij mówienie, aby zobaczyć transkrypcję",
  clickMicrophoneToStartRecording: "Kliknij mikrofon, aby rozpocząć nagrywanie",

  // Premium Voice Chat
  premiumVoiceChat: "Premium Chat Głosowy",
  premiumVoiceChatBenefits: "Korzyści Premium Chat Głosowy",
  premiumVoiceChatDescription: "Ćwicz {{practice}} w naturalnej rozmowie głosowej z premium tutor AI! AI pomoże ci poprawić gramatykę, słownictwo i wymowę.",
  premiumVoiceNote: "Premium Chat Głosowy jest ograniczony do 10 minut tygodniowo",
  premiumVoiceNoteWithReset: "Premium Chat Głosowy pozwala na 10 minut ćwiczeń tygodniowo. Czas odnawia się każdy poniedziałek o 6:00 rano (czas środkowy).",
  benefitNaturalVoice: "Naturalna interakcja głosowa podobna do ludzkiej z technologią ElevenLabs",
  benefitAccentPronunciation: "Precyzyjna wymowa i akcent dla głębokiej nauki",
  benefitRegularPractice: "10 minut ćwiczeń tygodniowo, odnawiane w poniedziałki o 6:00 rano",

  // Pronunciation practice
  pronunciationPractice: "Ćwiczenia wymowy",
  improvePronunciationSkillsWith: "Popraw swoje umiejętności wymowy dzięki ukierunkowanym ćwiczeniom",
  selectComplexityLevel: "Wybierz poziom złożoności",
  chooseDifficultyLevelBasedOn: "Wybierz poziom trudności na podstawie swojej biegłości językowej",
  speechRate: "Tempo mowy",
  selectLevelToStart: "Wybierz poziom, aby rozpocząć ćwiczenie",
  startExercise: "Rozpocznij ćwiczenie",
  pronunciationPracticeTips: "Wskazówki dotyczące ćwiczeń wymowy",
  listenCarefullyTip: "Słuchaj uważnie przed mówieniem",
  payAttentionToStressTip: "Zwracaj uwagę na akcent i intonację",
  practiceDifficultSoundsTip: "Ćwicz trudne dźwięki wielokrotnie",
  recordYourselfTip: "Nagraj siebie i porównaj z native speakerami",
  bePatientTip: "Bądź cierpliwy — poprawa wymowy wymaga czasu",
  practiceExercise: "Ćwiczenie",
  topic: "Temat",
  listenToPhrase: "Posłuchaj zwrotu",
  clickWordToHear: "Kliknij słowo, aby je usłyszeć",
  yourPronunciation: "Twoja wymowa",
  startRecording: "Rozpocznij nagrywanie",
  clickStartToRecord: "Kliknij 'Rozpocznij', aby nagrać",
  tryAgain: "Spróbuj ponownie",
  newPhrase: "Nowy zwrot",
  generatingExercise: "Generowanie ćwiczenia",
  generatingNewPhrase: "Generowanie nowego zwrotu",
  levelDescription: "Opis poziomu",
  failedToGeneratePhrase: "Nie udało się wygenerować zwrotu",
  noSpeechDetected: "Nie wykryto mowy",
  pleaseTryAgain: "Spróbuj ponownie",
  failedToAnalyzePronunciation: "Nie udało się przeanalizować wymowy",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Opinia o wymowie",
  accuracyScore: "Wynik dokładności",
  intonationScore: "Wynik intonacji",
  fluencyScore: "Wynik płynności",
  complexityScore: "Wynik złożoności",
  wordAnalysis: "Analiza słów",
  phonemeAnalysis: "Analiza fonemów",
  overallFeedback: "Ogólna opinia",
  excellent: "Doskonale",
  good: "Dobrze",
  fair: "Średnio",
  needsImprovement: "Wymaga poprawy",

  // Additional UI elements
  processing: "Przetwarzanie",
  stopRecording: "Zatrzymaj nagrywanie",
  listeningToYou: "Słucham cię",
  realTimeTranscription: "Transkrypcja w czasie rzeczywistym",
  yourTranscription: "Twoja transkrypcja",
  playing: "Odtwarzanie",

  // Complexity levels
  novice: "Początkujący",
  intermediate: "Średnio zaawansowany",
  advanced: "Zaawansowany",
  superior: "Biegły",
  noviceLevelDescription: "Może radzić sobie z podstawowymi i znanymi tematami",
  intermediateLevelDescription: "Może omawiać znane tematy",
  advancedLevelDescription: "Może pewnie radzić sobie ze złożonymi tematami",
  superiorLevelDescription: "Może wykonywać wszystkie funkcje językowe",
  noviceLevelShortDescription: "Proste zdania",
  intermediateLevelShortDescription: "Znane tematy",
  advancedLevelShortDescription: "Złożone tematy",
  superiorLevelShortDescription: "Wszystkie funkcje",

  // Transcript Analysis - English placeholders as requested
  progressOverview: "Progress Overview",
  trackLanguageLearningJourney: "Track Language Learning Journey",
  aiProgressAnalysis: "AI Progress Analysis",
  uploadLanguageTestTranscripts: "Upload language test transcripts",
  totalAnalyses: "Total Analyses",
  currentLevel: "Current Level",
  latestScore: "Latest Score",
  uploadAndAnalyze: "Upload and Analyze",
  analysisResults: "Analysis Results",
  progressTimeline: "Progress Timeline",
  firstTest: "First Test",
  latestTest: "Latest Test",
  improvement: "Improvement"
};

export default minimalTranslations;
