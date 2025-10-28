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
          
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
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
                className="w-48 h-auto"
              />
            </motion.div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-black" />
                <h2 className="text-3xl font-bold text-black">{certTitle}</h2>
                <Award className="w-6 h-6 text-black" />
              </div>
              
              <p className="text-lg font-semibold text-black/90">{certSubtitle}</p>
              <p className="text-sm text-black/70">{certDescription}</p>
              
              <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles className="w-5 h-5 text-black" />
                <span className="text-xl font-bold text-black">
                  Certificate Earned!
                </span>
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertNotification;
