
import { TranslationRecord } from "../types";
import russianCoreTranslations from "./core";
import russianPracticeTranslations from "./practice";

// Create voice chat translations for Russian
const russianVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "Бесплатная практика с голосом",
  "startSpeaking": "Начать говорить",
  "listeningNow": "Слушаю сейчас",
  "youSaid": "Вы сказали",
  "aiResponse": "Ответ ИИ",
  "conversationStarters": "Начало разговора",
  "tryThesePhrases": "Попробуйте эти фразы для начала разговора:",
  "practiceWithVoiceChat": "Практикуйтесь с голосовым чатом",
  "useThisTool": "Используйте этот инструмент для улучшения навыков говорения и слушания. Вот несколько советов:",
  "askQuestionsAboutTopics": "Задавайте вопросы на повседневные темы",
  "practiceEverydayPhrases": "Практикуйте обычные фразы и выражения",
  "describeWhatYouSee": "Описывайте то, что видите вокруг",
  "practiceVocabularyForSpecific": "Практикуйте словарь для конкретных тем, таких как путешествия или еда",
  "responseSuggestions": "Предложения ответов",
  "clickPlayToHear": "Нажмите воспроизведение, чтобы услышать произношение",
  "startConversationToSee": "Начните разговор, чтобы увидеть предложения",
  
  // Conversation phrases
  "phrase1": "Привет, как дела сегодня?",
  "phrase2": "Какая погода там, где вы находитесь?",
  "phrase3": "Можете ли вы порекомендовать хороший ресторан?",
  "phrase4": "Какие у вас хобби и интересы?",
  "phrase5": "Расскажите мне о вашей любимой книге или фильме.",
  "phrase6": "Что вы делали на прошлых выходных?",
  "phrase7": "Какие у вас планы на завтра?",
  "phrase8": "Как сказать... по-английски?",
  
  // Additional voice chat functionality
  "askQuestions": "Задавайте вопросы на повседневные темы",
  "practiceCommonPhrases": "Практикуйте обычные фразы и выражения",
  "browserBasedTTS": "Примечание: Это использует синтез речи на основе браузера. Для премиум качества голоса с ElevenLabs попробуйте наш Премиум голосовой чат.",
  "voiceChatEnded": "Голосовой чат завершен",
  "remaining": "осталось",
  "failedToGetResponse": "Не удалось получить ответ",
  "speechRecognitionError": "Ошибка распознавания речи",
  "speechRecognitionNotSupported": "Ваш браузер не поддерживает распознавание речи",
  "microphoneAccessRequired": "Требуется доступ к микрофону",
  "failedToGenerateSpeech": "Не удалось сгенерировать речь",
  "stopListening": "Прекратить слушать"
};

// Complete Russian translations with voice chat and practice integration
const russianTranslations: TranslationRecord = {
  ...russianCoreTranslations,
  ...russianVoiceChatTranslations,
  ...russianPracticeTranslations
};

export default russianTranslations;
