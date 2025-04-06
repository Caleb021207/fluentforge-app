
/**
 * Returns information about language pairs based on user's interface language
 * For language learning, we need to know which language the user is practicing
 * and which language they are learning
 */
export const getLanguagePair = (currentLanguage: string) => {
  switch (currentLanguage) {
    case "english":
      return {
        practice: "Spanish",
        native: "English"
      };
    case "spanish":
      return {
        practice: "English",
        native: "Spanish"
      };
    case "portuguese":
      return {
        practice: "English",
        native: "Portuguese"
      };
    case "korean":
      return {
        practice: "English",
        native: "Korean"
      };
    case "arabic":
      return {
        practice: "English",
        native: "Arabic"
      };
    case "mandarin":
      return {
        practice: "English",
        native: "Mandarin"
      };
    case "vietnamese":
      return {
        practice: "English",
        native: "Vietnamese"
      };
    case "hindi":
      return {
        practice: "English",
        native: "Hindi"
      };
    case "japanese":
      return {
        practice: "English",
        native: "Japanese"
      };
    case "russian":
      return {
        practice: "English",
        native: "Russian"
      };
    case "ukrainian":
      return {
        practice: "English",
        native: "Ukrainian"
      };
    case "french":
      return {
        practice: "English",
        native: "French"
      };
    default:
      return {
        practice: "Spanish",
        native: "English"
      };
  }
};
