import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface WelcomeTranslation {
  text: string;
  language: string;
}

const welcomeTranslations: WelcomeTranslation[] = [
  { text: "Welcome to Palavox", language: "English" },
  { text: "Bienvenido a Palavox", language: "Español" },
  { text: "Bem-vindo ao Palavox", language: "Português" },
  { text: "Bienvenue à Palavox", language: "Français" },
  { text: "欢迎来到 Palavox", language: "中文" },
  { text: "Palavox へようこそ", language: "日本語" },
  { text: "مرحباً بك في Palavox", language: "العربية" },
  { text: "Palavox में आपका स्वागत है", language: "हिन्दी" },
  { text: "Добро пожаловать в Palavox", language: "Русский" },
  { text: "Palavox에 오신 것을 환영합니다", language: "한국어" }
];

interface WelcomeAnimationProps {
  onComplete: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= welcomeTranslations.length) {
          setIsAnimating(false);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return nextIndex;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isAnimating, onComplete]);

  const handleSkip = () => {
    setIsAnimating(false);
    onComplete();
  };

  const currentTranslation = welcomeTranslations[currentIndex];

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      {/* Skip Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSkip}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4 mr-2" />
        Skip
      </Button>

      {/* Logo */}
      <div className="mb-12">
        <img 
          src="/lovable-uploads/c1a8d618-54a4-41f8-b53f-06f699ca6180.png" 
          alt="Palavox Logo" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain opacity-90"
        />
      </div>

      {/* Animated Text */}
      <div className="text-center min-h-[120px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {currentTranslation.text}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              {currentTranslation.language}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 flex space-x-2">
        {welcomeTranslations.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index <= currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeAnimation;