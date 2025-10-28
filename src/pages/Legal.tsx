import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Separator } from "@/components/ui/separator";

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/settings")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center gap-3">
              <FileText className="w-10 h-10 md:w-12 md:h-12" />
              Terms of Service & EULA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Legal agreements and user terms for Palavox
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                {/* Content will be added here */}
                <p className="text-muted-foreground">
                  Legal content will be added here...
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
