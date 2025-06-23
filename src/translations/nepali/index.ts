
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";
import classroomTranslations from "./classroom";
import certificatesTranslations from "./certificates";
import settingsTranslations from "./settings";
import progressTranslations from "./progress";
import premiumVoiceTranslations from "./premium-voice";

// Language object for Nepali
const languagesTranslations: TranslationRecord = {
  languages: {
    english: "अंग्रेजी",
    spanish: "स्पेनिश",
    portuguese: "पोर्तुगाली",
    french: "फ्रान्सेली",
    japanese: "जापानी",
    korean: "कोरियाली",
    mandarin: "मन्डारिन",
    cantonese: "क्यान्टोनिज",
    russian: "रूसी",
    arabic: "अरबी",
    hindi: "हिन्दी",
    vietnamese: "भियतनामी",
    ukrainian: "युक्रेनी",
    indonesian: "इन्डोनेसियाली",
    farsi: "फारसी",
    urdu: "उर्दू",
    pashto: "पाश्तो",
    swahili: "स्वाहिली",
    bengali: "बंगाली",
    somali: "सोमाली",
    yoruba: "योरुबा",
    amharic: "अम्हारिक",
    malayalam: "मलयालम",
    polish: "पोलिश",
    turkish: "टर्किश",
    romanian: "रोमानियाली",
    haitian: "हाइटियन",
    igbo: "इग्बो",
    tagalog: "तागालोग",
    german: "जर्मन",
    italian: "इटालियन",
    thai: "थाई",
    gujarati: "गुजराती",
    punjabi: "पञ्जाबी",
    nepali: "नेपाली",
    burmese: "बर्मी",
    karen: "करेन",
    tigrinya: "तिग्रिन्या",
    marathi: "मराठी",
    sinhala: "सिंहली"
  }
};

// Additional essential translations
const ferpaTranslations: TranslationRecord = {
  ferpaPrivacy: "FERPA गोपनीयता",
  ferpaSettings: "FERPA सेटिङहरू",
  ferpaCompliance: "FERPA अनुपालन",
  dataConsent: "डाटा सहमति",
  directoryInformation: "डाइरेक्टरी जानकारी",
  educationalRecords: "शैक्षिक रेकर्डहरू",
  privacyNotice: "गोपनीयता सूचना"
};

const safetyTranslations: TranslationRecord = {
  safetyPolicy: "सुरक्षा नीति",
  safetySettings: "सुरक्षा सेटिङहरू",
  contentFilter: "सामग्री फिल्टर",
  ageVerification: "उमेर प्रमाणीकरण",
  salesContactInfo: "बिक्री सम्पर्क जानकारी",
  safetyPolicyContactInfo: "सुरक्षा नीति सम्पर्क जानकारी"
};

const dataPrivacyTranslations: TranslationRecord = {
  privacyControls: "गोपनीयता नियन्त्रणहरू",
  dataSettings: "डाटा सेटिङहरू",
  privacySettings: "गोपनीयता सेटिङहरू"
};

const languageFrameworksTranslations: TranslationRecord = {
  cefrLevel: "CEFR स्तर",
  cefrB1Description: "मध्यम - परिचित विषयहरूमा छलफल गर्न सक्छ"
};

const landingAuthTranslations: TranslationRecord = {
  getStarted: "सुरु गर्नुहोस्",
  swipeUpToGetStarted: "सुरु गर्न माथि स्वाइप गर्नुहोस्"
};

// Combine all the translation categories
const nepaliTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
  ...authTranslations,
  ...classroomTranslations,
  ...certificatesTranslations,
  ...settingsTranslations,
  ...progressTranslations,
  ...premiumVoiceTranslations,
  ...languagesTranslations,
  ...ferpaTranslations,
  ...safetyTranslations,
  ...dataPrivacyTranslations,
  ...languageFrameworksTranslations,
  ...landingAuthTranslations,
  
  // Additional essential keys
  pageNotFound: "पृष्ठ फेला परेन",
  networkConnectionIssue: "नेटवर्क जडान समस्या",
  pleaseWait: "कृपया पर्खनुहोस्",
  cooldownActive: "शीतलन सक्रिय",
  dailyLimitReached: "दैनिक सीमा पुग्यो",
  speechSynthesisNotSupported: "बोली संश्लेषण समर्थित छैन",
  remaining: "बाँकी",
  incorrectPin: "गलत पिन",
  startConversationIn: "{{language}} मा कुराकानी सुरु गर्नुहोस्",
  continue: "जारी राख्नुहोस्"
};

export default nepaliTranslations;
