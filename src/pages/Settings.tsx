
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
          <h1 className="text-3xl font-bold mb-6 gradient-text flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            Settings
          </h1>
        </motion.div>
        
        {/* Usage Limits Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InteractiveCard className="w-full mb-6 glass">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              <div>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>Monitor your daily AI usage and remaining quota</CardDescription>
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
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield size={20} className="text-primary" />
              <div>
                <CardTitle>Parental Controls</CardTitle>
                <CardDescription>Manage safety and privacy settings</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 hover:shadow-lg transition-all" 
                onClick={() => navigate("/compliance")}
              >
                <Lock size={16} />
                Compliance
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 hover:shadow-lg transition-all" 
                onClick={() => navigate("/safety-policy")}
              >
                <FileText size={16} />
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
