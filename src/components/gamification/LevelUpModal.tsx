import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import { getLevelTier, getLevelColor } from "@/utils/levelSystem";
import { motion } from "framer-motion";
import ConfettiExplosion from "@/components/ui/confetti";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  totalXP: number;
}

const LevelUpModal = ({ open, onClose, oldLevel, newLevel, totalXP }: LevelUpModalProps) => {
  const tier = getLevelTier(newLevel);
  const colorGradient = getLevelColor(newLevel);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (open) {
      // Small delay to ensure everything is mounted
      const timer = setTimeout(() => {
        setReady(true);
        setShowConfetti(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setReady(false);
    }
  }, [open]);

  return (
    <>
      <ConfettiExplosion trigger={showConfetti} />
      <Dialog open={open && ready} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mx-auto w-24 h-24 mb-6"
          >
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
          <p className="text-muted-foreground mb-6">
            You've reached level <span className="font-bold text-foreground">{newLevel}</span>
          </p>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className="text-muted-foreground">Level {oldLevel}</span>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">Level {newLevel}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{tier} Tier</p>
            <p className="text-xs text-muted-foreground mt-1">{totalXP} Total XP</p>
          </div>

          <Button onClick={onClose} className="w-full" size="lg" variant="celebration">
            Continue Learning ✨
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default LevelUpModal;
