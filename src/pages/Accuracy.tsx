
import React from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import AuthenticatedAccuracy from "@/components/accuracy/AuthenticatedAccuracy";
import UnauthenticatedAccuracy from "@/components/accuracy/UnauthenticatedAccuracy";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";

const Accuracy = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <GradientBlob className="top-20 left-10" />
        <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
        <div className="max-w-4xl mx-auto p-4 relative z-10">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 relative z-10"
      >
        {isAuthenticated ? <AuthenticatedAccuracy /> : <UnauthenticatedAccuracy />}
        {!isAuthenticated && <AuthRequiredPrompt />}
      </motion.div>
    </div>
  );
};

export default Accuracy;
