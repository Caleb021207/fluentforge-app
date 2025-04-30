
import { TranslationRecord } from "./types";
import arabic from "./arabic";
import bengali from "./bengali";
import english from "./english";
import farsi from "./farsi";
import french from "./french";
import haitian from "./haitian";
import hindi from "./hindi";
import igbo from "./igbo";
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
import turkish from "./turkish";
import ukrainian from "./ukrainian";
import urdu from "./urdu";
import vietnamese from "./vietnamese";
import yoruba from "./yoruba";
import amharic from "./amharic";

// Map of all translations by language code
const translations: Record<string, TranslationRecord> = {
  english,
  spanish,
  portuguese,
  french,
  japanese,
  korean,
  mandarin,
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
  haitian,
  malayalam,
  igbo,
  polish,
  turkish,
  romanian
};

export default translations;
