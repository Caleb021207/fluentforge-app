
import common from "./common";
import auth from "./auth";
import dashboard from "./dashboard";
import practice from "./practice";
import voiceChat from "./voice-chat";
import premiumVoice from "./premium-voice";
import proVoice from "./pro-voice";
import uiElements from "./ui-elements";
import settings from "./settings";
import lessons from "./lessons";
import certifications from "./certifications";
import errors from "./errors";
import profile from "./profile";
import { TranslationModule, TranslationRecord } from "../types";

const translations: Record<TranslationModule, TranslationRecord> = {
  common: common,
  auth: auth,
  dashboard: dashboard,
  practice: practice,
  "voice-chat": voiceChat,
  "premium-voice": premiumVoice,
  "pro-voice": proVoice,
  "ui-elements": uiElements,
  settings: settings,
  lessons: lessons,
  certifications: certifications,
  errors: errors,
  profile: profile,
};

export default translations;
