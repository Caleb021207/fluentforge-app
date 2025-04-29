
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';

// Define the available Polly voices by language
const POLLY_VOICES: Record<string, Array<{ id: string, name: string, gender: string }>> = {
  english: [
    { id: 'Joanna', name: 'Joanna', gender: 'Female' },
    { id: 'Matthew', name: 'Matthew', gender: 'Male' },
    { id: 'Salli', name: 'Salli', gender: 'Female' },
    { id: 'Joey', name: 'Joey', gender: 'Male' },
  ],
  spanish: [
    { id: 'Lupe', name: 'Lupe', gender: 'Female' },
    { id: 'Miguel', name: 'Miguel', gender: 'Male' },
    { id: 'Penelope', name: 'Penélope', gender: 'Female' },
  ],
  french: [
    { id: 'Celine', name: 'Céline', gender: 'Female' },
    { id: 'Mathieu', name: 'Mathieu', gender: 'Male' },
    { id: 'Lea', name: 'Léa', gender: 'Female' },
  ],
  japanese: [
    { id: 'Takumi', name: 'Takumi', gender: 'Male' },
    { id: 'Mizuki', name: 'Mizuki', gender: 'Female' },
  ],
  korean: [
    { id: 'Seoyeon', name: 'Seoyeon', gender: 'Female' },
  ],
  arabic: [
    { id: 'Zeina', name: 'Zeina', gender: 'Female' },
  ],
  hindi: [
    { id: 'Aditi', name: 'Aditi', gender: 'Female' },
    { id: 'Kajal', name: 'Kajal', gender: 'Female' },
  ],
  vietnamese: [
    { id: 'Hiếu', name: 'Hiếu', gender: 'Male' },
  ],
  indonesian: [
    { id: 'Danendra', name: 'Danendra', gender: 'Male' },
  ],
  russian: [
    { id: 'Maxim', name: 'Maxim', gender: 'Male' },
    { id: 'Tatyana', name: 'Tatyana', gender: 'Female' },
  ],
  mandarin: [
    { id: 'Zhiyu', name: 'Zhiyu', gender: 'Female' },
  ],
  ukrainian: [
    { id: 'Sofiya', name: 'Sofiya', gender: 'Female' },
  ]
};

interface PollyTTSSettingsProps {
  voiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

const PollyTTSSettings = ({ voiceId, onVoiceChange }: PollyTTSSettingsProps) => {
  const { currentLanguage } = useLocalization();
  
  // Get the available voices for the current language or default to English
  const availableVoices = POLLY_VOICES[currentLanguage.toLowerCase()] || POLLY_VOICES.english;
  
  // If the current voiceId isn't in the available voices, default to the first one
  const isVoiceAvailable = availableVoices.some(voice => voice.id === voiceId);
  const [selectedVoice, setSelectedVoice] = useState<string>(isVoiceAvailable ? voiceId : availableVoices[0].id);

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    onVoiceChange(value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Voice</label>
      <Select value={selectedVoice} onValueChange={handleVoiceChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select voice" />
        </SelectTrigger>
        <SelectContent>
          {availableVoices.map((voice) => (
            <SelectItem key={voice.id} value={voice.id}>
              {voice.name} ({voice.gender})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PollyTTSSettings;
