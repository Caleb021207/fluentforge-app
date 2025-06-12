
import { TranslationRecord } from "../types";
import common from "./common";
import auth from "./auth";
import navigation from "./navigation";
import dashboard from "./dashboard";
import practice from "./practice";
import certificates from "./certificates";
import classroom from "./classroom";
import languageSelection from "./language-selection";
import languages from "./languages";

const tokpisinTranslations: TranslationRecord = {
  ...common,
  ...auth,
  ...navigation,
  ...dashboard,
  ...practice,
  ...certificates,
  ...classroom,
  ...languageSelection,
  ...languages,
};

export default tokpisinTranslations;
