
import { TranslationRecord } from "../types";

// Clean, focused Greek translations for core UI elements only
const greekCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "Αρχική",
  "practice": "Εξάσκηση", 
  "textPractice": "Εξάσκηση Κειμένου",
  "unlimitedVoicePractice": "Απεριόριστη Φωνητική Εξάσκηση",
  "voiceChat": "Φωνητική Συνομιλία",
  "pronunciationPractice": "Εξάσκηση Προφοράς",
  "logout": "Αποσύνδεση",
  "login": "Σύνδεση",
  "signIn": "Είσοδος",
  "createAccount": "Δημιουργία Λογαριασμού",
  
  // Home page elements
  "welcomeToLanguageLearning": "Καλώς ήρθατε στην Εκμάθηση Γλωσσών",
  "yourPersonalAICompanion": "Ο προσωπικός σας σύντροφος AI για την εκμάθηση γλωσσών", 
  "swipeUpToGetStarted": "Σύρετε προς τα πάνω για να ξεκινήσετε",
  "getStarted": "Ξεκινήστε",
  "goToDashboard": "Μετάβαση στον Πίνακα Ελέγχου",
  
  // Text practice page
  "practiceYourLanguage": "Εξασκηθείτε στα {{language}} σας",
  "chatWithAI": "Συνομιλήστε με την AI μας για να εξασκηθείτε στα {{language}}! Η AI θα σας βοηθήσει να διορθώσετε τη γραμματική, το λεξιλόγιό σας και θα σας δώσει συμβουλές για την προφορά και τον πολιτισμό των {{language}}.",
  "startConversationIn": "Ξεκινήστε συνομιλία στα {{language}}",
  "practiceGuide": "Οδηγός Εξάσκησης {{language}}",
  "practiceGuideDescription": "Εδώ είναι μερικές συμβουλές για να αξιοποιήσετε στο έπακρο την εξάσκησή σας στα {{language}}:",
  "practiceGuideItem1": "Προσπαθήστε να δημιουργήσετε πλήρεις προτάσεις, ακόμα κι αν είναι απλές.",
  "practiceGuideItem2": "Μην ανησυχείτε για τα λάθη - είναι μέρος της μάθησης!",
  "practiceGuideItem3": "Ζητήστε εξηγήσεις αν υπάρχει κάτι που δεν καταλαβαίνετε.",
  "practiceGuideItem4": "Χρησιμοποιήστε λέξεις που μάθατε πρόσφατα.",
  "practiceDisclaimer": "Η AI μας θα προσαρμοστεί στο επίπεδο ικανοτήτων σας και θα σας βοηθήσει να βελτιωθείτε σταδιακά.",
  "startTextChatting": "Ξεκινήστε συνομιλία κειμένου",
  "typeMessageToPractice": "Πληκτρολογήστε το μήνυμά σας για εξάσκηση στα {{language}}...",
  "send": "Αποστολή",
  "clearConversation": "Εκκαθάριση Συνομιλίας",
  "correctGrammar": "Διόρθωση Γραμματικής",
  
  // Voice chat page
  "freePracticeWithVoice": "Δωρεάν Εξάσκηση με Φωνή",
  "startSpeaking": "Αρχίστε να Μιλάτε",
  "listeningNow": "Ακούω Τώρα",
  "youSaid": "Είπατε",
  "aiResponse": "Απάντηση AI",
  "conversationStarters": "Εκκινητές Συνομιλίας",
  "tryThesePhrases": "Δοκιμάστε αυτές τις φράσεις για να ξεκινήσετε μια συνομιλία:",
  "practiceWithVoiceChat": "Εξασκηθείτε με Φωνητική Συνομιλία",
  "useThisTool": "Χρησιμοποιήστε αυτό το εργαλείο για να βελτιώσετε τις δεξιότητες ομιλίας και ακρόασής σας. Εδώ είναι μερικές συμβουλές:",
  "askQuestionsAboutTopics": "Κάντε ερωτήσεις για καθημερινά θέματα",
  "practiceEverydayPhrases": "Εξασκηθείτε σε κοινές φράσεις και εκφράσεις", 
  "describeWhatYouSee": "Περιγράψτε αυτό που βλέπετε γύρω σας",
  "practiceVocabularyForSpecific": "Εξασκηθείτε στο λεξιλόγιο για συγκεκριμένα θέματα όπως ταξίδια ή φαγητό",
  "responseSuggestions": "Προτάσεις Απαντήσεων",
  "clickPlayToHear": "Κάντε κλικ στο play για να ακούσετε την προφορά",
  "startConversationToSee": "Ξεκινήστε μια συνομιλία για να δείτε προτάσεις",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "Βελτιώστε τις δεξιότητες προφοράς σας με στοχευμένες ασκήσεις",
  "selectComplexityLevel": "Επιλέξτε Επίπεδο Πολυπλοκότητας",
  "chooseDifficultyLevelBasedOn": "Επιλέξτε επίπεδο δυσκολίας βάσει της γλωσσικής σας ικανότητας", 
  "selectLevelToStart": "Επιλέξτε επίπεδο για να ξεκινήσετε την εξάσκηση",
  "pronunciationPracticeTips": "Συμβουλές Εξάσκησης Προφοράς",
  "listenCarefullyTip": "Ακούστε προσεκτικά τον ήχο πριν προσπαθήσετε να μιλήσετε",
  "payAttentionToStressTip": "Προσέξτε τα μοτίβα έμφασης και τον τονισμό",
  "practiceDifficultSoundsTip": "Εξασκηθείτε σε δύσκολους ήχους πολλές φορές",
  "recordYourselfTip": "Ηχογραφήστε τον εαυτό σας και συγκρίνετε με φυσικούς ομιλητές",
  "bePatientTip": "Να είστε υπομονετικοί - η βελτίωση της προφοράς χρειάζεται χρόνο",
  "novice": "Αρχάριος",
  "intermediate": "Μεσαίος", 
  "advanced": "Προχωρημένος",
  "superior": "Ανώτερος",
  "startExercise": "Ξεκινήστε Άσκηση",
  "speechRate": "Ρυθμός Ομιλίας",
  
  // Common UI elements
  "loading": "Φόρτωση...",
  "error": "Σφάλμα",
  "cancel": "Ακύρωση",
  "save": "Αποθήκευση",
  "back": "Πίσω",
  "continue": "Συνέχεια",
  "processing": "Επεξεργασία..."
};

export default greekCoreTranslations;
