
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "እንኳን ወደ ቋንቋ መማር በደህና መጡ",
  yourPersonalAICompanion: "የእርስዎ የግል AI ረዳት ለቋንቋ መማር",
  startPracticing: "ልምምድ ጀምር",
  practiceYourLanguageSkills: "የቋንቋ ችሎታዎችዎን ይለማመዱ",
  swipeUpToGetStarted: "ለመጀመር ወደ ላይ ይሸብብሩ",
  getStarted: "ጀምር",
  selectYourLanguagePreferences: "የቋንቋ ምርጫዎችዎን ይምረጡ",

  // Language selection
  selectNativeLanguage: "የእናት ቋንቋዎን ይምረጡ",
  iSpeak: "እኔ እናገራለሁ",
  saveLanguagePreferences: "የቋንቋ ምርጫዎችን ያስቀምጡ",

  // Auth
  signIn: "ግባ",
  signUp: "መዝገብ",
  signInToContinue: "ለመቀጠል ይግቡ",
  createAccountToGetStarted: "ለመጀመር ሒሳብ ይፍጠሩ",
  email: "ኢሜይል",
  password: "የይለፍ ቃል",
  accessPasscode: "የመግቢያ ኮድ",
  dontHaveAccount: "ሒሳብ የለዎትም?",
  alreadyHaveAccount: "ቀደም ሲል ሒሳብ አለዎት?",

  // Header
  loggedInAs: "ተገብተዋል እንደ",
  signedInAs: "ተገብተዋል እንደ",
  logout: "ውጣ",
  lightMode: "የብርሃን ሁነታ",

  // Navigation
  home: "መነሻ",
  practice: "ልምምድ",
  textPractice: "የጽሑፍ ልምምድ",
  unlimitedVoicePracticeNav: "ያልተገደበ የድምፅ ልምምድ",
  pronunciationPracticeNav: "የአነባበብ ልምምድ",
  aiAnalysis: "የAI ትንተና",
  profile: "መገለጫ",
  settings: "ቅንብሮች",

  // Practice page
  englishPractice: "የእንግሊዝኛ ልምምድ",
  startChatting: "ውይይት ጀምር",
  startConversationIn: "በ{{language}} ውይይት ጀምር",
  fixGrammar: "ሰዋሱን አስተካክል",
  correctGrammar: "ሰዋሱን አስተካክል",
  clearConversation: "ውይይትን አጥፋ",
  startTextChat: "የጽሑፍ ውይይት ጀምር",
  startTextChatting: "የጽሑፍ ውይይት ጀምር",
  typeMessageBelow: "ከታች መልእክት ይተይቡ",
  typeMessageToPractice: "{{language}} ለመለማመድ መልእክት ይተይቡ...",
  send: "ላክ",

  // Practice Guide
  practiceGuide: "የ{{language}} ልምምድ መመሪያ",
  practiceGuideTitle: "የ{{language}} ልምምድ መመሪያ",
  practiceGuideDescription: "ውጤታማ የ{{language}} ልምምድ ለማድረግ አንዳንድ ጠቃሚ ምክሮች፦",
  practiceGuideIntro: "ውጤታማ የ{{language}} ልምምድ ለማድረግ አንዳንድ ጠቃሚ ምክሮች፦",
  practiceGuideTip1: "ቀላል ቢሆንም ሙሉ ዓረፍተ ነገሮችን ለመፍጠር ይሞክሩ።",
  practiceGuideTip2: "ስህተት ስለመሥራት አይፍሩ — የመማር ክፍል ነው!",
  practiceGuideTip3: "የማይገባዎት ነገር ካለ ማብራሪያ ይጠይቁ።",
  practiceGuideTip4: "በቅርቡ የተማሯቸውን ቃላት ይጠቀሙ።",
  practiceGuideTip5: "የእኛ AI በክህሎት ደረጃዎ ይስማማል።",

  // Practice tips - using t() keys
  practiceTip1: "ቀላል ቢሆንም ሙሉ ዓረፍተ ነገሮችን ለመፍጠር ይሞክሩ።",
  practiceTip2: "ስህተት ስለመሥራት አይፍሩ — የመማር ክፍል ነው!",
  practiceTip3: "የማይገባዎት ነገር ካለ ማብራሪያ ይጠይቁ።",
  practiceTip4: "በቅርቡ የተማሯቸውን ቃላት ይጠቀሙ។",
  practiceTip5: "የእኛ AI በክህሎት ደረጃዎ ይስማማል።",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "ቀላል ቢሆንም ሙሉ ዓረፍተ ነገሮችን ለመፍጠር ይሞክሩ።",
  "Don't worry about mistakes — they're part of learning!": "ስህተት ስለመሥራት አይፍሩ — የመማር ክፍል ነው!",
  "Ask for explanations if there's something you don't understand.": "የማይገባዎት ነገር ካለ ማብራሪያ ይጠይቁ።",
  "Use words you've learned recently.": "በቅርቡ የተማሯቸውን ቃላት ይጠቀሙ።",
  "Our AI will adapt to your skill level and gradually help you improve.": "የእኛ AI በክህሎት ደረጃዎ ይስማማል እና ቀስ በቀስ እንዲሻሻሉ ይረዳዎታል።",
  "Here are some tips to get the most out of your {{language}} practice:": "ከ{{language}} ልምምድዎ ከፍተኛውን ለማግኘት አንዳንድ ምክሮች፦",

  // Hint button
  suggestionResponses: "የተሟላ ምላሾች",
  responseSuggestions: "የተሟላ ምላሾች",
  clickPlayToHearPronunciation: "አነባበብን ለመስማት ይጫኑ",
  startConversationForSuggestions: "ምክሮችን ለማግኘት ውይይት ጀምር",
  startConversationToSeeSuggestions: "ምክሮችን ለማየት ውይይት ጀምር",
  getResponseSuggestions: "የምላሽ ምክሮችን ያግኙ",
  greetings: "ሰላምታዎች",
  questions: "ጥያቄዎች",
  error: "ስህተት",
  couldNotGenerateHints: "ምክሮችን መፍጠር አልተቻለም",
  failedToPlayAudio: "ድምፅ ማጫወት አልተቻለም",
  play: "አጫውት",

  // Voice chat
  unlimitedVoicePractice: "ያልተገደበ የድምፅ ልምምድ",
  practiceDescription: "የልምምድ መግለጫ",
  aiModelInfo: "የAI ሞዴል መረጃ፦ OpenAI GPT-4o-mini ለተፈጥሮ ቋንቋ መረዳት እና ማመንጨት፣ የድምፅ ምላሾች ለሚሰጥ የአሳሽ TTS።",
  practiceLevel: "የልምምድ ደረጃ",
  intermediatePracticeLevel: "መካከለኛ — የሚታወቁ ርዕሶችን መወያየት ይችላል",
  "Intermediate - Can discuss familiar topics": "መካከለኛ — የሚታወቁ ርዕሶችን መወያየት ይችላል",

  // CEFR Level Descriptions
  cefrB1Description: "መካከለኛ — የሚታወቁ ርዕሶችን መወያየት ይችላል",
  cefrA1Description: "ጀማሪ — መሰረታዊ ዓረፍተ ነገሮች እና አገላለጾች",
  cefrA2Description: "መሰረታዊ — ቀላል የዕለት ተዕለት ውይይት",
  cefrB2Description: "ከፍተኛ መካከለኛ — በቀላሉ መግባባት ይችላል",

  currentLanguage: "የአሁኑ ቋንቋ",
  practiceLanguage: "የልምምድ ቋንቋ",
  startSpeaking: "ማውራት ጀምር",
  stopListening: "ማዳመጥን አቁም",
  listeningNow: "አሁን እየሰማ ነው",
  youSaid: "ያልከው",
  conversationStarters: "የውይይት አጀማሪዎች",
  howToStartConversation: "ውይይት እንዴት እንደሚጀመር",
  tryThesePhrases: "እነዚህን ሐረጎች ይሞክሩ፦",
  conversationStarter1: "ሰላም! ዛሬ እንዴት ነዎት?",
  conversationStarter2: "በእርስዎ ቦታ የአየር ሁኔታ እንዴት ነው?",
  conversationStarter3: "ጥሩ ምግብ ቤት ልትመክሩኝ ትችላላችሁ?",
  conversationStarter4: "የእርስዎ የትርፍ ጊዜ ማሳለፊያዎች እና ፍላጎቶች ምንድን ናቸው?",
  conversationStarter5: "ስለ እርስዎ ተወዳጅ መፃህፍት ወይም ፊልሞች ይንገሩኝ።",
  conversationStarter6: "ባለፈው ሳምንት ምን አደረጉ?",
  conversationStarter7: "ለነገ የእርስዎ እቅዶች ምንድን ናቸው?",
  conversationStarter8: "በስፓኒሽ/እንግሊዝኛ ... እንዴት ይባላል?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "ሰላም፣ ዛሬ እንዴት ነዎት?",
  "What's the weather like where you are?": "በእርስዎ ቦታ የአየር ሁኔታ እንዴት ነው?",
  "Can you recommend a good restaurant?": "ጥሩ ምግብ ቤት ልትመክሩኝ ትችላላችሁ?",
  "What are your hobbies and interests?": "የእርስዎ የትርፍ ጊዜ ማሳለፊያዎች እና ፍላጎቶች ምንድን ናቸው?",
  "Tell me about your favorite book or movie.": "ስለ እርስዎ ተወዳጅ መፃህፍት ወይም ፊልሞች ይንገሩኝ።",
  "What did you do last weekend?": "ባለፈው ሳምንት ምን አደረጉ?",
  "What are your plans for tomorrow?": "ለነገ የእርስዎ እቅዶች ምንድን ናቸው?",
  "How do you say... in Spanish/English?": "በስፓኒሽ/እንግሊዝኛ ... እንዴት ይባላል?",

  practiceWithVoiceChat: "በድምፅ ውይይት ልምምድ ያድርጉ",
  voiceChatTips: "የእንግሊዝኛ ንግግርና የመስማት ክህሎቶችዎን ለማሻሻል ይህንን መሳሪያ ይጠቀሙ። ከዚህ በታች አንዳንድ ምክሮች፦",
  voiceTip1: "ስለ ዕለታዊ ጉዳዮች ጥያቄዎችን ይጠይቁ",
  voiceTip2: "የተለመዱ ሐረጎችና አገላለጾችን ይለማመዱ",
  voiceTip3: "በአካባቢዎ የሚያዩትን ይግለጹ",
  voiceTip4: "እንደ ጉዞ ወይም ምግብ ላሉ ልዩ ርዕሶች ቃላትን ይለማመዱ",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "የእንግሊዝኛ ንግግርና የመስማት ክህሎቶችዎን ለማሻሻል ይህንን መሳሪያ ይጠቀሙ። ከዚህ በታች አንዳንድ ምክሮች፦",
  "Ask questions about everyday topics": "ስለ ዕለታዊ ጉዳዮች ጥያቄዎችን ይጠይቁ",
  "Practice common phrases and expressions": "የተለመዱ ሐረጎችና አገላለጾችን ይለማመዱ",
  "Describe what you see around you": "በአካባቢዎ የሚያዩትን ይግለጹ",
  "Practice vocabulary for specific topics like travel or food": "እንደ ጉዞ ወይም ምግብ ላሉ ልዩ ርዕሶች ቃላትን ይለማመዱ",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "ተከታቢ ጽሑፍ ለማየት ማውራት ጀምር",
  clickMicrophoneToStartRecording: "መቅዳት ለመጀመር ማይክሮፎንን ይጫኑ",

  // Premium Voice Chat
  premiumVoiceChat: "ልዩ የድምፅ ውይይት",
  premiumVoiceChatBenefits: "የልዩ የድምፅ ውይይት ጥቅሞች",
  premiumVoiceChatDescription: "ከልዩ AI አስተማሪ ጋር በተፈጥሮዊ የድምፅ ውይይት {{practice}} ይለማመዱ! AI ሰዋሰው፣ ቃላት እና አነባበብ እንዲሻሻሉ ይረዳዎታል።",
  premiumVoiceNote: "ልዩ የድምፅ ውይይት በሳምንት ለ10 ደቂቃዎች የተገደበ ነው",
  premiumVoiceNoteWithReset: "ልዩ የድምፅ ውይይት በሳምንት 10 ደቂቃ ልምምድ ያስችላል። ጊዜው በየሰኞ ጠዋት 6:00 (ማዕከላዊ ጊዜ) ይታደሳል።",
  benefitNaturalVoice: "የElevenLabs ቴክኖሎጂን በመጠቀም እንደ ሰው የሚመስል ተፈጥሮዊ የድምፅ መስተጋብር",
  benefitAccentPronunciation: "ለጠለቅ ትምህርት ትክክለኛ አነባበብ እና ዘዬ",
  benefitRegularPractice: "በሳምንት 10 ደቂቃ ልምምድ፣ ሰኞ ጠዋት 6:00 ላይ ይታደሳል",

  // Pronunciation practice
  pronunciationPractice: "የአነባበብ ልምምድ",
  improvePronunciationSkillsWith: "በዒላማ ባለው ልምምድ የአነባበብ ክህሎቶችዎን ያሻሽሉ",
  selectComplexityLevel: "የውስብስብነት ደረጃን ይምረጡ",
  chooseDifficultyLevelBasedOn: "በቋንቋ ችሎታዎ ላይ በመመስረት የችግር ደረጃን ይምረጡ",
  speechRate: "የንግግር ፍጥነት",
  selectLevelToStart: "ልምምድ ለመጀመር ደረጃ ይምረጡ",
  startExercise: "ልምምድ ጀምር",
  pronunciationPracticeTips: "የአነባበብ ልምምድ ምክሮች",
  listenCarefullyTip: "ከመናገርዎ በፊት በጥንቃቄ ያዳምጡ",
  payAttentionToStressTip: "ለጭንቀት እና የድምፅ ቃና ትኩረት ይስጡ",
  practiceDifficultSoundsTip: "አስቸጋሪ ድምፆችን ተደጋግመው ይለማመዱ",
  recordYourselfTip: "እራስዎን መዝግበው ከአገላዳጆች ጋር ያወዳድሩ",
  bePatientTip: "ታግሰው — የአነባበብ ማሻሻያ ጊዜ ይወስዳል",
  practiceExercise: "ልምምድ",
  topic: "ርዕስ",
  listenToPhrase: "ሐረግ ያዳምጡ",
  clickWordToHear: "ለመስማት ቃሉን ይጫኑ",
  yourPronunciation: "የእርስዎ አነባበብ",
  startRecording: "መቅዳት ጀምር",
  clickStartToRecord: "ለመቅዳት 'ጀምር' ይጫኑ",
  tryAgain: "እንደገና ይሞክሩ",
  newPhrase: "አዲስ ሐረግ",
  generatingExercise: "ልምምድ እየተፈጠረ ነው",
  generatingNewPhrase: "አዲስ ሐረግ እየተፈጠረ ነው",
  levelDescription: "የደረጃ መግለጫ",
  failedToGeneratePhrase: "ሐረግ መፍጠር አልተሳካም",
  noSpeechDetected: "ምንም ንግግር አልተገኘም",
  pleaseTryAgain: "እባክዎን እንደገና ይሞክሩ",
  failedToAnalyzePronunciation: "አነባበብ መተንተን አልተሳካም",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "የአነባበብ ምላሽ",
  accuracyScore: "የትክክለኛነት ነጥብ",
  intonationScore: "የድምፅ ቃና ነጥብ",
  fluencyScore: "የቀላልነት ነጥብ",
  complexityScore: "የውስብስብነት ነጥብ",
  wordAnalysis: "የቃል ትንተና",
  phonemeAnalysis: "የፎኒም ትንተና",
  overallFeedback: "አጠቃላይ ምላሽ",
  excellent: "በጣም ጥሩ",
  good: "ጥሩ",
  fair: "ደህና",
  needsImprovement: "ማሻሻያ ያስፈልጋል",

  // Additional UI elements
  processing: "እየተሰራ",
  stopRecording: "መቅዳትን አቁም",
  listeningToYou: "እርስዎን እየሰማ ነው",
  realTimeTranscription: "በእውነተኛ ጊዜ ቅጂ",
  yourTranscription: "የእርስዎ ቅጂ",
  playing: "እየተጫወተ",

  // Complexity levels
  novice: "ጀማሪ",
  intermediate: "መካከለኛ",
  advanced: "የላቀ",
  superior: "ከፍተኛ",
  noviceLevelDescription: "መሰረታዊ እና የሚታወቁ ርዕሶችን መቆጣጠር ይችላል",
  intermediateLevelDescription: "የሚታወቁ ርዕሶችን መወያየት ይችላል",
  advancedLevelDescription: "በራስ መተማመን ውስብስብ ርዕሶችን መቆጣጠር ይችላል",
  superiorLevelDescription: "ሁሉንም የቋንቋ ተግባራት ማከናወን ይችላል",
  noviceLevelShortDescription: "ቀላል ዓረፍተ ነገሮች",
  intermediateLevelShortDescription: "የሚታወቁ ርዕሶች",
  advancedLevelShortDescription: "ውስብስብ ርዕሶች",
  superiorLevelShortDescription: "ሁሉም ተግባራት",

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
