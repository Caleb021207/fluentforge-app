import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import certBadgeFunctional from "@/assets/cert-functional.png";
import certBadgeProfessional from "@/assets/cert-professional.png";
import ConfettiExplosion from 'react-confetti-explosion';

interface CertNotificationProps {
  show: boolean;
  certType: 'functional' | 'professional' | null;
}

const CertNotification: React.FC<CertNotificationProps> = ({ show, certType }) => {
  if (!show || !certType) return null;

  const isFunctional = certType === 'functional';
  const certImage = isFunctional ? certBadgeFunctional : certBadgeProfessional;
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
            force={0.8}
            duration={3000}
            particleCount={200}
            width={1600}
          />
          
          <div className="bg-gradient-to-br from-primary via-primary/90 to-accent rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: 3,
                ease: "easeInOut"
              }}
            >
              <img
                src={certImage}
                alt={certTitle}
                className="w-40 h-auto drop-shadow-2xl"
              />
            </motion.div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-white" />
                <h2 className="text-3xl font-bold text-white">{certTitle}</h2>
                <Award className="w-6 h-6 text-white" />
              </div>
              
              <p className="text-lg font-semibold text-white/90">{certSubtitle}</p>
              <p className="text-sm text-white/80">{certDescription}</p>
              
              <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-xl font-bold text-white">
                  Certificate Earned!
                </span>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertNotification;
