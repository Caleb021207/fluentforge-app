import React, { useCallback, useRef, useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playTTS } from "@/utils/tts";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  /** Text to read aloud. */
  text: string;
  /** Language name understood by the TTS layer (e.g. "english"). */
  language?: string;
  className?: string;
  /** Icon-only ghost button by default; set to render a labeled button. */
  label?: string;
  size?: "icon" | "sm" | "default";
}

/**
 * A small speaker button that reads text aloud via the shared TTS layer
 * (Azure/Supabase with browser speech synthesis fallback). Essential for ESL
 * learners who can read less comfortably than they can listen.
 */
export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  language = "english",
  className,
  label,
  size = "icon",
}) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (e: React.MouseEvent) => {
      // Never trigger the surrounding answer button / card click.
      e.stopPropagation();
      e.preventDefault();
      if (playing) {
        audioRef.current?.pause();
        setPlaying(false);
        return;
      }
      setPlaying(true);
      const audio = await playTTS({
        text,
        language,
        onEnd: () => setPlaying(false),
        onError: () => setPlaying(false),
      });
      audioRef.current = audio;
      if (!audio) {
        // Browser-TTS fallback resolves without an element; reset shortly.
        setTimeout(() => setPlaying(false), Math.min(8000, 300 + text.length * 60));
      }
    },
    [text, language, playing],
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={speak}
      aria-label={playing ? "Stop audio" : "Listen"}
      className={cn("text-muted-foreground hover:text-primary", className)}
    >
      {playing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
};

export default SpeakButton;
