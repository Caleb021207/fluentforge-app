
import generalTranslations from './general';
import uiElementsTranslations from './ui-elements';
import voiceChatTranslations from './voice-chat';
import premiumVoiceTranslations from './premium-voice';
import practiceTranslations from './practice';
import { TranslationRecord } from '../types';

const urduTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...practiceTranslations
};

export default urduTranslations;
