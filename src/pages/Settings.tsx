
import React from "react";
import { Shield, FileText, TrendingUp, Lock, Sparkles } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { UsageDashboard } from "@/components/usage/UsageDashboard";
import { useNavigate } from "react-router-dom";
import { InteractiveCard, Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";

const Settings = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
              Settings
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Manage your account and preferences
            </p>
          </div>
        </motion.div>
        
        {/* Usage Limits Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InteractiveCard className="w-full mb-6 glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">Usage Limits</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Monitor your daily AI usage and remaining quota
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </InteractiveCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <UsageDashboard />
        </motion.div>
        
        {/* Parental Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InteractiveCard className="w-full glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">Parental Controls</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Manage safety and privacy settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-3 justify-center sm:justify-between">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:shadow-lg transition-all" 
                onClick={() => navigate("/compliance")}
              >
                <Lock className="w-4 h-4" />
                Compliance
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:shadow-lg transition-all" 
                onClick={() => navigate("/safety-policy")}
              >
                <FileText className="w-4 h-4" />
                Safety Policy
              </Button>
            </CardFooter>
          </InteractiveCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <ParentalControls />
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
