
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Core practice functionality
  "practice": "Practice",
  "startConversation": "Start Conversation",
  "startChatting": "Start chatting with your AI language tutor!",
  "chatPlaceholder": "Type your message to practice {targetLanguage}...",
  "errorSendingMessage": "Error sending message. Please try again.",
  "emptyMessage": "Cannot send empty message",
  "sendingMessage": "Sending message...",
  "practiceGuide": "Practice Guide",
  "practiceTip1": "Try to form complete sentences, even if they're simple.",
  "practiceTip2": "Don't worry about mistakes — they're part of learning!",
  "practiceTip3": "Ask for explanations if there's something you don't understand.",
  "practiceTip4": "Use words you've recently learned.",
  "practiceTip5": "Our AI will adapt to your skill level and gradually help you improve.",
  "startConversationIn": "Start conversation in {language}",
  "typeMessageIn": "Type message in {language}...",
  "translationNotAvailable": "Translation not available for {language}",
  "contentFiltered": "Content filtered for safety",
  "networkConnectionIssue": "Network connection issue. Please try again.",
  "send": "Send",
  "error": "Error",
  "failedToGetTranslation": "Failed to get translation. Please try again.",
  "translationError": "Translation Error",
  "startTextChatting": "Start text chatting",
  "typeMessageBelow": "Type a message below",
  "realTimeTranscription": "Real-time transcription",
  
  // Language metrics and analysis
  "viewLanguageMetrics": "View Language Metrics",
  "hideMetrics": "Hide Metrics",
  "languageMetrics": "Language Metrics",
  "grammarAccuracy": "Grammar Accuracy",
  "conversationComplexity": "Conversation Complexity",
  "vocabularyDiversity": "Vocabulary Diversity",
  "basedOnMessagesCount": "Based on {count} messages",
  "analyzeConversation": "Analyze Conversation",
  "analyzing": "Analyzing...",
  "analyzingConversation": "Analyzing your conversation...",
  "noLanguageDataYet": "No language data yet. Click the button below to analyze your conversation.",
  "notEnoughMessages": "Not enough messages",
  "needMoreMessagesToAnalyze": "You need at least 4 messages to analyze your conversation.",
  "failedToAnalyzeConversation": "Failed to analyze conversation. Please try again.",
  
  // Grammar correction toggle
  "correctGrammar": "Correct my grammar",
  "grammarCorrectionEnabled": "Grammar correction enabled",
  "grammarCorrectionDisabled": "Grammar correction disabled",
  "tutor.willCorrectGrammar": "The tutor will now provide gentle corrections to your grammar.",
  "tutor.wontCorrectGrammar": "The tutor will focus on conversation flow without grammar corrections.",
  
  // Chat management
  "clearConversation": "Clear Conversation",
  "conversationCleared": "Conversation cleared",
  "success": "Success",
  
  // Empty states and warnings
  "emptyMessageReceived": "Empty message received",
  "someContentWasFiltered": "Some content was filtered for safety",
  
  // Loading and status indicators
  "processing": "Processing...",
  "retrying": "Retrying...",
  "connecting": "Connecting...",
  "thinking": "Thinking...",
  "generating": "Generating...",
  
  // Audio and TTS functionality
  "play": "Play",
  "playAudio": "Play Audio",
  "playTargetLanguageAudio": "Play target language audio",
  "playNativeLanguageAudio": "Play native language audio",
  "failedToPlayAudio": "Failed to play audio",
  "audioNotSupported": "Audio not supported",
  "ttsError": "Text-to-speech error",
  
  // Hint and suggestion system
  "getResponseSuggestions": "Get response suggestions",
  "responseSuggestions": "Response Suggestions",
  "clickPlayToHearPronunciation": "Click play to hear pronunciation",
  "startConversationForSuggestions": "Start a conversation to get suggestions",
  "greetings": "Greetings",
  "questions": "Questions",
  "responses": "Responses",
  "topics": "Topics",
  "couldNotGenerateHints": "Could not generate hints",
  "hintGenerationFailed": "Hint generation failed",
  
  // Practice prompts and starters
  "practicePrompt": "Hello! I'd like to practice {{targetLanguage}} conversation with you. Please help me by correcting my grammar, vocabulary, and {{targetLanguage}} usage. Can we start with some basic conversation?",
  "sendPracticePrompt": "Send Practice Prompt",
  "languageLearningPrompt": "Language Learning Prompt",
  "conversationStarters": "Conversation Starters",
  "topicSuggestions": "Topic Suggestions",
  
  // Pronunciation practice
  "pronunciationPractice": "Pronunciation Practice",
  "improvePronunciationSkills": "Improve your pronunciation skills with targeted practice",
  "improvePronunciationSkillsWith": "Improve your pronunciation skills with targeted exercises in {language}",
  "practiceExercise": "Practice Exercise",
  "selectComplexityLevel": "Select Complexity Level",
  "novice": "Novice",
  "intermediate": "Intermediate", 
  "advanced": "Advanced",
  "superior": "Superior",
  "noviceLevelShortDescription": "Basic expressions and greetings",
  "intermediateLevelShortDescription": "Simple conversations and questions",
  "advancedLevelShortDescription": "Complex sentences and concepts",
  "superiorLevelShortDescription": "Academic and professional language",
  "selectLevelToStart": "Select a level to start practicing",
  "tryAgain": "Try Again",
  "newPhrase": "New Phrase",
  "excellent": "Excellent",
  "good": "Good",
  "fair": "Fair",
  "needsImprovement": "Needs Improvement",
  "excellentPronunciationFeedback": "Excellent! Your pronunciation is very accurate.",
  "goodPronunciationFeedback": "Good job! Your pronunciation is mostly accurate.",
  "fairPronunciationFeedback": "Fair. Keep practicing to improve your pronunciation.",
  "needsImprovementPronunciationFeedback": "Needs more practice. Focus on the highlighted words.",
  "failedToGeneratePhrase": "Failed to generate a practice phrase. Please try again.",
  "failedToAnalyzePronunciation": "Failed to analyze pronunciation. Please try again.",
  
  // Pronunciation practice interface
  "chooseDifficultyLevelBasedOn": "Choose a difficulty level based on your language proficiency",
  "startExercise": "Start Exercise",
  "generatingExercise": "Generating exercise...",
  "generatingNewPhrase": "Generating new phrase...",
  "levelDescription": "Level Description",
  "difficultyLevel": "Difficulty Level",
  "noviceLevelDescription": "Basic expressions with simple vocabulary. Perfect for beginners.",
  "intermediateLevelDescription": "Everyday phrases with moderate vocabulary. Good for intermediate learners.",
  "advancedLevelDescription": "Complex sentences with advanced vocabulary. Suited for proficient learners.",
  "superiorLevelDescription": "Academic and professional content with specialized vocabulary.",
  "pronunciationPracticeTips": "Pronunciation Practice Tips",
  "listenCarefullyTip": "Listen carefully to the audio before attempting to speak",
  "payAttentionToStressTip": "Pay attention to stress patterns and intonation",
  "practiceDifficultSoundsTip": "Practice difficult sounds multiple times",
  "recordYourselfTip": "Record yourself and compare with native speakers",
  "bePatientTip": "Be patient - pronunciation improvement takes time",
  "listenToPhrase": "Listen to phrase",
  "playing": "Playing...",
  "topic": "Topic",
  "clickWordToHear": "Click on a word to hear it",
  
  // Recording functionality
  "clickStartToRecord": "Click 'Start Recording' to begin",
  "startRecording": "Start Recording",
  "stopRecording": "Stop Recording",
  "yourPronunciation": "Your Pronunciation",
  "listeningToYou": "Listening to you...",
  "loading": "Loading...",
  "microphoneAccessRequired": "Microphone Access Required",
  "allowMicAccess": "Please allow microphone access to use this feature",
  "microphoneAccessFailed": "Failed to access microphone",
  "speechRecognitionError": "Speech Recognition Error",
  "speechRecognitionNotSupported": "Speech recognition is not supported in your browser",
  "noSpeechDetected": "No Speech Detected",
  "pleaseTryAgain": "Please try again",
  
  // Chat interface
  "messageCouldNotBeSent": "Message could not be sent",
  "pleaseTypeMessage": "Please type a message",
  "typeYourMessage": "Type your message...",
  "messageIsBeingSent": "Message is being sent...",
  "chatInputPlaceholder": "Type your practice message here...",
  "enterToSend": "Press Enter to send",
  "shiftEnterNewLine": "Shift+Enter for new line",
  
  // Message content and translation
  "originalMessage": "Original Message",
  "translatedMessage": "Translated Message",
  "showTranslation": "Show Translation",
  "hideTranslation": "Hide Translation",
  "translationUnavailable": "Translation unavailable",
  "translationFailed": "Translation failed",
  
  // Practice guide and tips
  "practiceGuideDescription": "Here are some tips to make the most of your {language} practice:",
  "practiceGuideItem1": "Try to form complete sentences, even if they're simple.",
  "practiceGuideItem2": "Don't worry about making mistakes — they're part of learning!",
  "practiceGuideItem3": "Ask for clarifications if you don't understand something.",
  "practiceGuideItem4": "Try to use vocabulary you've recently learned.",
  "practiceDisclaimer": "Our AI will adapt to your skill level and help you improve gradually.",
  
  // Voice chat functionality
  "startVoiceChat": "Start Voice Chat",
  "stopVoiceChat": "Stop Voice Chat",
  "voiceChatActive": "Voice chat active",
  "voiceChatInactive": "Voice chat inactive",
  "clickToStartVoice": "Click 'Start Voice Chat' to begin speaking with the tutor",
  "voiceChatNotSupported": "Voice chat is not supported in your browser",
  "voiceRecognitionError": "Voice recognition error",
  
  // Practice session management
  "practiceSession": "Practice Session",
  "practiceComplete": "Practice Complete",
  "practiceScore": "Practice Score",
  "practiceTime": "Practice Time",
  "practiceProgress": "Practice Progress",
  "sessionSaved": "Session saved",
  "sessionEnded": "Session ended",
  
  // Skills assessment
  "getSkillsAssessment": "Get Skills Assessment",
  "skillsAssessment": "Skills Assessment",
  "reading": "Reading",
  "writing": "Writing",
  "speaking": "Speaking",
  "listening": "Listening",
  "overallLevel": "Overall Level",
  "assessmentComplete": "Assessment Complete",
  "assessmentInProgress": "Assessment in progress",
  
  // Additional practice features
  "practiceWithTextChat": "Practice With Text Chat",
  "textConversationPractice": "Text Conversation Practice",
  "noticeTextBasedPractice": "Notice: This is a text-based practice feature. For voice practice, try our Unlimited Voice Chat or Premium Voice Chat features.",
  "sendEnglishPracticePrompt": "Send English Practice Prompt",
  "askAboutGrammarRules": "Ask about grammar rules",
  "practiceConversationsDifferentSituations": "Practice conversations in different situations",
  "learnNewVocabulary": "Learn new vocabulary",
  "discussCulturalTopics": "Discuss cultural topics",
  "practiceConversation": "Practice Conversation",
  
  // Error handling
  "somethingWentWrong": "Something went wrong",
  "tryRefreshing": "Try refreshing the page",
  "connectionLost": "Connection lost",
  "reconnecting": "Reconnecting...",
  "requestTimeout": "Request timeout",
  "serverError": "Server error",
  "unknownError": "Unknown error occurred"
};

export default practiceTranslations;
