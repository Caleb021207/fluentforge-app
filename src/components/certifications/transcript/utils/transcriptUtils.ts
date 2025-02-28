
interface TranscriptLine {
  text: string;
  isUser: boolean;
}

/**
 * Attempts to format a raw transcript into a structured conversation with user and AI messages
 */
export const formatTranscriptLines = (transcript: string): TranscriptLine[] => {
  if (!transcript) return [];
  
  // Simple case: Check if there are indicators of a conversation structure
  const hasConversationIndicators = 
    transcript.includes("User:") || 
    transcript.includes("AI:") || 
    transcript.includes("Prompt:") ||
    transcript.includes("Response:");
  
  if (!hasConversationIndicators) {
    // If no conversation structure is detected, treat the entire transcript as user speech
    return [{
      text: transcript.trim(),
      isUser: true
    }];
  }
  
  // Try to split the transcript into lines and identify user/AI parts
  const lines: TranscriptLine[] = [];
  const rawLines = transcript.split(/\n+/);
  
  let currentSpeaker: 'user' | 'ai' | null = null;
  let currentText = '';
  
  for (const line of rawLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check for speaker indicators
    if (trimmedLine.match(/^(User|Me|I):/i)) {
      // Save previous speaker's text if any
      if (currentSpeaker && currentText) {
        lines.push({
          text: currentText.trim(),
          isUser: currentSpeaker === 'user'
        });
      }
      currentSpeaker = 'user';
      currentText = trimmedLine.replace(/^(User|Me|I):/i, '').trim();
    } 
    else if (trimmedLine.match(/^(AI|Assistant|Bot|System):/i)) {
      // Save previous speaker's text if any
      if (currentSpeaker && currentText) {
        lines.push({
          text: currentText.trim(),
          isUser: currentSpeaker === 'user'
        });
      }
      currentSpeaker = 'ai';
      currentText = trimmedLine.replace(/^(AI|Assistant|Bot|System):/i, '').trim();
    }
    else if (trimmedLine.match(/^(Prompt|Question):/i)) {
      // Save previous speaker's text if any
      if (currentSpeaker && currentText) {
        lines.push({
          text: currentText.trim(),
          isUser: currentSpeaker === 'user'
        });
      }
      currentSpeaker = 'ai';
      currentText = trimmedLine.replace(/^(Prompt|Question):/i, '').trim();
    }
    else if (trimmedLine.match(/^(Response|Answer):/i)) {
      // Save previous speaker's text if any
      if (currentSpeaker && currentText) {
        lines.push({
          text: currentText.trim(),
          isUser: currentSpeaker === 'user'
        });
      }
      currentSpeaker = 'user';
      currentText = trimmedLine.replace(/^(Response|Answer):/i, '').trim();
    }
    else if (currentSpeaker) {
      // Continue with the current speaker
      currentText += ' ' + trimmedLine;
    } 
    else {
      // If no speaker is identified yet, assume it's the user
      currentSpeaker = 'user';
      currentText = trimmedLine;
    }
  }
  
  // Add the last speaker's text if any
  if (currentSpeaker && currentText) {
    lines.push({
      text: currentText.trim(),
      isUser: currentSpeaker === 'user'
    });
  }
  
  // If we couldn't parse the conversation structure, use the original text as user speech
  if (lines.length === 0) {
    lines.push({
      text: transcript.trim(),
      isUser: true
    });
  }
  
  return lines;
};
