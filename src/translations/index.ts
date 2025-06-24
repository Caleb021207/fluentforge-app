
import { TranslationRecord } from "./types";
import arabic from "./arabic";
import bengali from "./bengali";
import cantonese from "./cantonese";
import english from "./english";
import farsi from "./farsi";
import french from "./french";
import hindi from "./hindi";
import indonesian from "./indonesian";
import japanese from "./japanese";
import korean from "./korean";
import malayalam from "./malayalam";
import mandarin from "./mandarin";
import pashto from "./pashto";
import polish from "./polish";
import portuguese from "./portuguese";
import romanian from "./romanian";
import russian from "./russian";
import somali from "./somali";
import spanish from "./spanish";
import swahili from "./swahili";
import tagalog from "./tagalog";
import turkish from "./turkish";
import ukrainian from "./ukrainian";
import urdu from "./urdu";
import vietnamese from "./vietnamese";
import yoruba from "./yoruba";
import amharic from "./amharic";
import igbo from "./igbo";
import haitian from "./haitian";

// Import new languages
import german from "./german";
import italian from "./italian";
import thai from "./thai";
import burmese from "./burmese";
import karen from "./karen";
import nepali from "./nepali";
import tigrinya from "./tigrinya";
import punjabi from "./punjabi";
import marathi from "./marathi";
import gujarati from "./gujarati";
import sinhala from "./sinhala";

import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "./constants";

// Map of all translations by language code
const translations: Record<string, TranslationRecord> = {
  english,
  spanish,
  portuguese,
  french,
  japanese,
  korean,
  mandarin,
  cantonese,
  russian,
  arabic,
  hindi,
  vietnamese,
  ukrainian,
  indonesian,
  farsi,
  urdu,
  pashto,
  swahili,
  bengali,
  somali,
  yoruba,
  amharic,
  malayalam,
  polish,
  turkish,
  romanian,
  igbo,
  haitian,
  tagalog,
  // Add new languages
  german,
  italian,
  thai,
  burmese,
  karen,
  nepali,
  tigrinya,
  punjabi,
  marathi,
  gujarati,
  sinhala,
};

export { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES };
export default translations;
