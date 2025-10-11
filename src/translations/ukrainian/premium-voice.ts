
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Преміум голосовий чат",
  premiumVoiceChatBenefits: "Переваги преміум голосу",
  textConversationPractice: "Практика текстових розмов",
  cefrA1Description: "Початковий - Базові фрази та вирази",
  cefrA2Description: "Елементарний - Просте повсякденне спілкування",
  cefrB1Description: "Середній - Може обговорювати знайомі теми",
  cefrB2Description: "Вище середнього - Може спілкуватися вільно",
  beginner: "Початковий",
  elementary: "Елементарний",
  intermediate: "Середній",
  upperIntermediate: "Вище середнього",
  selectCEFRLevel: "Виберіть рівень CEFR",
  selectedLevel: "Обраний рівень",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Досягнуто тижневий ліміт",
  cooldownActive: "Досягнуто тижневий ліміт",
  waitBeforeNextSession: "Вам потрібно зачекати перед початком наступної сесії",
  cooldownPeriodDescription: "Вам потрібно зачекати {{time}} перед початком наступного преміум голосового чату.",
  resetsAt6AM: "Ваш тижневий ліміт у 10 хвилин буде скинуто через {{time}} (понеділок о 6:00 ранку)",
  dailyLimitReached: "Ви використали свій тижневий ліміт у 10 хвилин. Час буде скинуто в понеділок о 6:00 ранку.",
  premiumSessionLimitReached: "Досягнуто тижневий ліміт преміум-сесій",
  
  // Login related messages
  loginRequired: "Потрібна авторизація",
  pleaseLoginToAccessPremiumFeature: "Будь ласка, увійдіть в акаунт для доступу до преміум голосового чату",
  redirectingToLogin: "Перенаправлення на сторінку входу",
  failedToStartSession: "Не вдалося почати сесію",
  failedToCreateSession: "Не вдалося створити сесію",
  loginRequiredDescription: "Для доступу до функції преміум голосового чату, будь ласка, увійдіть у свій обліковий запис.",
  
  // Success messages
  conversationHistoryCleared: "Історія розмови очищена",
  remaining: "залишилося на цей тиждень",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "Проводьте природні голосові бесіди з нашим преміум ШІ-репетитором для практики {{practice}}! ШІ допоможе виправити вашу граматику, словниковий запас та вимову.",
  premiumVoiceNote: "Використання преміум голосового чату обмежено однією 10-хвилинною сесією на тиждень",
  premiumVoiceNoteWithReset: "Преміум голосовий чат надає 10 хвилин часу практики щотижня. Ваш час скидається кожен понеділок о 6:00 ранку за центральним часом.",
  benefitNaturalVoice: "Природна, людська голосова взаємодія з використанням технології ElevenLabs",
  benefitAccentPronunciation: "Точний акцент та вимова для занурення в навчання",
  benefitRegularPractice: "10 хвилин часу практики щотижня, скидання кожен понеділок о 6:00 ранку за центральним часом",

  // Voice chat controls
  startVoiceChat: "Почати голосовий чат",
  stopVoiceChat: "Зупинити голосовий чат",
  voiceChatEnded: "Голосовий чат завершено",
  timeLimit10MinReached: "Досягнуто ліміту часу в 10 хвилин",
  speaking: "Говорить...",
  startChatting: "Почати розмову",
  
  // Additional translations
  elevenlabsLikeHumanVoice: "Високоякісні голосові відповіді ШІ від ElevenLabs",
  startPremiumChat: "Почати преміум-чат",
  endPremiumChat: "Завершити преміум-чат",
  premiumFeatures: "Преміум-функції",
  naturalSounding: "Природно звучний голос",
  noTimeLimits: "Без обмежень часу",
  improvedAccuracy: "Покращене розпізнавання мовлення",
  upgradeExperience: "Покращте свій досвід навчання",
  unlimitedPractice: "Необмежена практика з користувачем",
  improvedSpeakingSkills: "Покращені навички розмовного мовлення",
  betterAccent: "Краще сприйняття акценту та розуміння",
  goingPlaces: "Просувайтеся далі з преміум-функціями",
  error: "Помилка",
  success: "Успіх"
};

export default premiumVoiceTranslations;
