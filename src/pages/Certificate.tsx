import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CertificateDisplay from "@/components/certificates/CertificateDisplay";
import { getCurrentFluencyCertStatus } from "@/utils/fluencyCertification";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { useRef } from "react";

const Certificate = () => {
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  // Fetch user profile for name
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch transcript analyses to determine cert level
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['transcript-analyses-cert'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transcript_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const certStatus = getCurrentFluencyCertStatus(analyses);
  
  // Get the date when the cert level was first achieved
  const achievementDate = analyses?.find(a => {
    const analysisLevel = a.cefr_level?.toUpperCase();
    if (certStatus.level === 'professional') {
      return analysisLevel === 'B2' || analysisLevel === 'C1' || analysisLevel === 'C2';
    } else if (certStatus.level === 'functional') {
      return analysisLevel === 'B1';
    }
    return false;
  })?.upload_date;

  const formattedDate = achievementDate 
    ? new Date(achievementDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.info("Generating certificate...", {
        description: "Please wait while we prepare your download."
      });

      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      const userName = profile?.display_name || profile?.email || 'Student';
      const levelName = certStatus.level === 'professional' ? 'Professional' : 'Functional';
      link.download = `Palavox-Certificate-${userName}-${levelName}-Fluency.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Certificate downloaded!", {
        description: "Your certificate has been saved to your device."
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error("Download failed", {
        description: "There was an error generating your certificate. Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/analysis')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </Button>
            
            {certStatus.level && (
              <Button
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
            )}
          </div>

          {/* Certificate */}
          <div ref={certificateRef}>
            <CertificateDisplay
              userName={profile?.display_name || profile?.email || 'Student'}
              certLevel={certStatus.level}
              achievementDate={formattedDate}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Certificate;
