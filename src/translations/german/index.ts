
import { TranslationRecord } from "../types";
import germanCoreTranslations from "./core";

// Create voice chat translations for German
const germanVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "Kostenlose Übung mit Sprache",
  "startSpeaking": "Sprechen beginnen",
  "listeningNow": "Höre jetzt zu",
  "youSaid": "Sie sagten",
  "aiResponse": "KI-Antwort",
  "conversationStarters": "Gesprächsanfänger",
  "tryThesePhrases": "Probieren Sie diese Phrasen aus, um ein Gespräch zu beginnen:",
  "practiceWithVoiceChat": "Üben Sie mit Voice-Chat",
  "useThisTool": "Verwenden Sie dieses Tool, um Ihre Sprech- und Hörfähigkeiten zu verbessern. Hier sind einige Tipps:",
  "askQuestionsAboutTopics": "Stellen Sie Fragen zu alltäglichen Themen",
  "practiceEverydayPhrases": "Üben Sie gebräuchliche Phrasen und Ausdrücke",
  "describeWhatYouSee": "Beschreiben Sie, was Sie um sich herum sehen",
  "practiceVocabularyForSpecific": "Üben Sie Vokabeln für spezifische Themen wie Reisen oder Essen",
  "responseSuggestions": "Antwortvorschläge",
  "clickPlayToHear": "Klicken Sie auf Wiedergabe, um die Aussprache zu hören",
  "startConversationToSee": "Beginnen Sie ein Gespräch, um Vorschläge zu sehen",
  
  // Conversation phrases
  "phrase1": "Hallo, wie geht es Ihnen heute?",
  "phrase2": "Wie ist das Wetter dort, wo Sie sind?",
  "phrase3": "Können Sie ein gutes Restaurant empfehlen?",
  "phrase4": "Was sind Ihre Hobbys und Interessen?",
  "phrase5": "Erzählen Sie mir von Ihrem Lieblingsbuch oder -film.",
  "phrase6": "Was haben Sie letztes Wochenende gemacht?",
  "phrase7": "Was sind Ihre Pläne für morgen?",
  "phrase8": "Wie sagt man... auf Englisch?",
  
  // Additional voice chat functionality
  "askQuestions": "Stellen Sie Fragen zu alltäglichen Themen",
  "practiceCommonPhrases": "Üben Sie gebräuchliche Phrasen und Ausdrücke",
  "browserBasedTTS": "Hinweis: Dies verwendet browserbasierte Text-zu-Sprache. Für Premium-Sprachqualität mit ElevenLabs probieren Sie unseren Premium Voice Chat.",
  "voiceChatEnded": "Voice-Chat beendet",
  "remaining": "verbleibend",
  "failedToGetResponse": "Antwort konnte nicht abgerufen werden",
  "speechRecognitionError": "Spracherkennungsfehler",
  "speechRecognitionNotSupported": "Ihr Browser unterstützt keine Spracherkennung",
  "microphoneAccessRequired": "Mikrofonzugriff erforderlich",
  "failedToGenerateSpeech": "Sprache konnte nicht generiert werden",
  "stopListening": "Aufhören zuzuhören"
};

// Complete German translations with voice chat integration
const germanTranslations: TranslationRecord = {
  ...germanCoreTranslations,
  ...germanVoiceChatTranslations
};

export default germanTranslations;
