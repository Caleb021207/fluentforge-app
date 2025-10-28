import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import certCelebration from "@/assets/cert-celebration.png";
import ConfettiExplosion from 'react-confetti-explosion';

interface CertNotificationProps {
  show: boolean;
  certType: 'functional' | 'professional' | null;
}

const CertNotification: React.FC<CertNotificationProps> = ({ show, certType }) => {
  if (!show || !certType) return null;

  const isFunctional = certType === 'functional';
  const certTitle = isFunctional ? 'Functionally Fluent!' : 'Professionally Fluent!';
  const certSubtitle = isFunctional 
    ? 'ACTFL Intermediate Mid' 
    : 'ACTFL Advanced Low';
  const certDescription = isFunctional
    ? 'You can handle everyday conversations!'
    : 'You can work professionally in this language!';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6 
          }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <ConfettiExplosion
            force={1.2}
            duration={5000}
            particleCount={500}
            width={2400}
            height={1200}
          />
          
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-md">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: 3,
                ease: "easeInOut"
              }}
            >
              <img
                src={certCelebration}
                alt="Celebration"
                className="w-64 h-auto drop-shadow-2xl"
              />
            </motion.div>
            
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-7 h-7 text-black" />
                <h2 className="text-4xl font-bold text-black">{certTitle}</h2>
                <Award className="w-7 h-7 text-black" />
              </div>
              
              <p className="text-xl font-semibold text-black/90">{certSubtitle}</p>
              <p className="text-base text-black/70">{certDescription}</p>
              
              <div className="flex items-center justify-center gap-2 pt-3">
                <Sparkles className="w-6 h-6 text-black" />
                <span className="text-2xl font-bold text-black">
                  Certificate Earned!
                </span>
                <Sparkles className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertNotification;
