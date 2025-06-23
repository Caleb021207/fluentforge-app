
import { TranslationRecord } from "../types";

// Clean, focused Mongolian translations for core UI elements only
const mongolianCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "Гэр",
  "practice": "Дасгал", 
  "textPractice": "Бичгийн дасгал",
  "unlimitedVoicePractice": "Хязгааргүй дуут дасгал",
  "voiceChat": "Дуут чат",
  "pronunciationPractice": "Дуудлагын дасгал",
  "logout": "Гарах",
  "login": "Нэвтрэх",
  "signIn": "Бүртгүүлэх",
  "createAccount": "Бүртгэл үүсгэх",
  
  // Home page elements
  "welcomeToLanguageLearning": "Хэл сурлагад тавтай морил",
  "yourPersonalAICompanion": "Хэл сурах таны хувийн AI хамтрагч", 
  "swipeUpToGetStarted": "Эхлэхийн тулд дээш шудрах",
  "getStarted": "Эхлэх",
  "goToDashboard": "Хяналтын самбар руу очих",
  
  // Text practice page
  "practiceYourLanguage": "{{language}} хэлээ дасгал хийх",
  "chatWithAI": "{{language}} хэл дасгал хийхэд манай AI-тай чатлах! AI нь таны дүрэм, үгийн сангийг засч, {{language}} хэлний дуудлага, соёлын талаар зөвлөгөө өгнө.",
  "startConversationIn": "{{language}} хэлээр яриа эхлүүлэх",
  "practiceGuide": "{{language}} дасгалын гарын авлага",
  "practiceGuideDescription": "{{language}} дасгалаасаа хамгийн их ашиг хүртэх зөвлөмжүүд:",
  "practiceGuideItem1": "Энгийн ч гэсэн бүрэн өгүүлбэр гаргахыг хичээгээрэй.",
  "practiceGuideItem2": "Алдааны талаар санаа зовох хэрэггүй - эдгээр нь сурлагын нэг хэсэг!",
  "practiceGuideItem3": "Ойлгохгүй зүйл байвал тайлбар асуугаарай.",
  "practiceGuideItem4": "Саяхан сурсан үгсээ ашиглаарай.",
  "practiceDisclaimer": "Манай AI нь таны ур чадварын түвшинд тохируулж, аажмаар сайжруулахад туслана.",
  "startTextChatting": "Бичгийн чат эхлүүлэх",
  "typeMessageToPractice": "{{language}} дасгал хийхэд мессежээ бичнэ үү...",
  "send": "Илгээх",
  "clearConversation": "Яриаг арилгах",
  "correctGrammar": "Дүрэм засах",
  
  // Voice chat page
  "freePracticeWithVoice": "Дуугаар үнэгүй дасгал",
  "startSpeaking": "Ярьж эхлэх",
  "listeningNow": "Одоо сонсож байна",
  "youSaid": "Та хэлсэн",
  "aiResponse": "AI-н хариулт",
  "conversationStarters": "Яриа эхлүүлэгчид",
  "tryThesePhrases": "Яриа эхлүүлэхэд эдгээр хэллэгийг туршиж үзээрэй:",
  "practiceWithVoiceChat": "Дуут чатаар дасгал хийх",
  "useThisTool": "Ярих, сонсох чадвараа сайжруулахын тулд энэ хэрэгслийг ашиглаарай. Зарим зөвлөмжүүд:",
  "askQuestionsAboutTopics": "Өдөр тутмын сэдвүүдээр асуулт асуугаарай",
  "practiceEverydayPhrases": "Өдөр тутмын хэллэг, илэрхийллийг дасгалаарай", 
  "describeWhatYouSee": "Эргэн тойронд харж буй зүйлсээ тайлбарлаарай",
  "practiceVocabularyForSpecific": "Аялал, хоол зэрэг тодорхой сэдвүүдийн үгийн санг дасгалаарай",
  "responseSuggestions": "Хариултын санал",
  "clickPlayToHear": "Дуудлага сонсохын тулд тоглуулах товчийг дараарай",
  "startConversationToSee": "Саналыг харахын тулд яриа эхлүүлээрэй",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "Зорилтот дасгалаар дуудлагын чадвараа сайжруулаарай",
  "selectComplexityLevel": "Нарийн төвөгтэй түвшин сонгох",
  "chooseDifficultyLevelBasedOn": "Хэлний чадавхид тулгуурлан хүндрэлийн түвшин сонгоорой", 
  "selectLevelToStart": "Дасгал эхлүүлэх түвшин сонгоорой",
  "pronunciationPracticeTips": "Дуудлагын дасгалын зөвлөмжүүд",
  "listenCarefullyTip": "Ярихыг оролдохоосоо өмнө дууг анхааралтай сонсоорой",
  "payAttentionToStressTip": "Даралт, өргөлтийн хэв маягт анхаарлаа хандуулаарай",
  "practiceDifficultSoundsTip": "Хэцүү дууг олон удаа дасгалаарай",
  "recordYourselfTip": "Өөрийгөө бичлэг хийж, эх хэлтэнтэй харьцуулаарай",
  "bePatientTip": "Тэвчээртэй байгаарай - дуудлага сайжруулахад цаг хугацаа шаардагдана",
  "novice": "Анхан шат",
  "intermediate": "Дунд шат", 
  "advanced": "Ахисан шат",
  "superior": "Дээд шат",
  "startExercise": "Дасгал эхлүүлэх",
  "speechRate": "Ярианы хурд",
  
  // Common UI elements
  "loading": "Ачаалж байна...",
  "error": "Алдаа",
  "cancel": "Цуцлах",
  "save": "Хадгалах",
  "back": "Буцах",
  "continue": "Үргэлжлүүлэх",
  "processing": "Боловсруулж байна..."
};

export default mongolianCoreTranslations;
