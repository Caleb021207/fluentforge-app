
import { TranslationRecord } from "../types";
import commonTranslations from "./common";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";

// Combine all translation sections
const persianTranslations: TranslationRecord = {
  ...commonTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  
  // Add any additional translations here
  phrase1: "سلام، حالت چطوره؟",
  phrase2: "من در حال یادگیری انگلیسی هستم.",
  phrase3: "می‌توانی به من کمک کنی؟",
  phrase4: "اسم من چیست؟",
  phrase5: "اهل کجا هستی؟",
  phrase6: "دوست دارم با تو صحبت کنم.",
  phrase7: "فردا چه برنامه‌ای داری؟",
  phrase8: "من می‌خواهم به آمریکا سفر کنم.",
};

export default persianTranslations;
