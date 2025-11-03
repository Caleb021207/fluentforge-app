
import React from "react";
import { FileText, TrendingUp, Shield, Lock, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import { TokenUsageLimits } from "@/components/usage/TokenUsageLimits";
import { useNavigate } from "react-router-dom";
import { InteractiveCard, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();
  
  const documentLinks = [
    {
      title: "Terms of Service & EULA",
      description: "Read our terms, conditions, and end user license agreement",
      icon: <FileText className="w-5 h-5" />,
      path: "/legal",
      external: false
    }
  ] as const;
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-10 text-center flex flex-col items-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center gap-3 justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              Settings
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Manage your usage and access important documents
            </motion.p>
          </div>
        </motion.div>
        
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-7 h-7 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">Usage Dashboard</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground ml-10">
              Track your monthly usage limits and remaining quota
            </p>
          </div>
          
          <TokenUsageLimits />
        </motion.section>

        <Separator className="my-10" />
        
        {/* Documents & Compliance Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-7 h-7 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">Legal & Compliance</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground ml-10">
              Access official policies, terms, and compliance documentation
            </p>
          </div>
          
          <div className="flex justify-center">
            {documentLinks.map((doc, index) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="max-w-md w-full"
              >
                <InteractiveCard 
                  className="glass h-full cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50 border-primary/20 hover:border-primary/40"
                  onClick={() => {
                    if (doc.external) {
                      window.open(doc.path, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(doc.path);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                          {doc.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {doc.title}
                            {doc.external && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                          </CardTitle>
                          <CardDescription className="mt-1.5 text-sm">
                            {doc.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <Card className="glass border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Your Data is Protected</p>
                    <p>
                      Palavox is committed to protecting student privacy and maintaining compliance with FERPA, COPPA, and CIPA regulations. 
                      We collect minimal data and never share personal information with third parties.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Settings;
