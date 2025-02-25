
export const playAudio = async (text: string): Promise<void> => {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};
