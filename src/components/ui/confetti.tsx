import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

const ConfettiExplosion: React.FC<ConfettiProps> = ({ 
  trigger, 
  duration = 3000,
  particleCount = 30 
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; color: string; x: number; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#A3D5FF', '#57D8A1', '#FFD700', '#FF69B4', '#9370DB'];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 100 - 50,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              y: 0, 
              x: 0, 
              scale: 1, 
              opacity: 1,
              rotate: 0 
            }}
            animate={{
              y: -window.innerHeight,
              x: particle.x * 10,
              scale: [1, 1.5, 0.5],
              opacity: [1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiExplosion;
