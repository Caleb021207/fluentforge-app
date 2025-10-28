
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { Upload, FileImage, FileText, File } from "lucide-react";
import { checkCertAchievement } from "@/utils/fluencyCertification";
import CertNotification from "@/components/ui/cert-notification";
import { useState as useReactState } from "react";
import { useXPNotification } from "@/contexts/XPNotificationContext";

interface TranscriptUploadProps {
  onUploadSuccess: () => void;
}

const TranscriptUpload: React.FC<TranscriptUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { awardXP } = useGamification();
  const { triggerXPNotification } = useXPNotification();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCertNotification, setShowCertNotification] = useReactState(false);
  const [certType, setCertType] = useReactState<'functional' | 'professional' | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Ensure authenticated session before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signOut();
      toast({
        title: "Session expired",
        description: "Please sign in again to upload transcripts.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
      navigate('/auth');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create file path with user ID folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(25);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('transcripts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      setUploadProgress(50);

      // Convert file to base64 for GPT Vision
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          
          setUploadProgress(75);

          // Call the analyze-transcript edge function
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-transcript', {
            body: {
              imageData: base64Data,
              fileName: file.name,
              fileType: file.type
            }
          });

          if (analysisError) throw analysisError;

          if (!analysisData.success) {
            throw new Error(analysisData.error || 'Analysis failed');
          }

          setUploadProgress(90);

          // Get file URL for storage
          const { data: { publicUrl } } = supabase.storage
            .from('transcripts')
            .getPublicUrl(fileName);

          // Save analysis to database
          const analysisRecord = {
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_url: publicUrl,
            analysis_status: 'completed',
            overall_score: analysisData.analysis.overall_score,
            cefr_level: analysisData.analysis.cefr_level,
            reading_listening_score: analysisData.analysis.reading_listening_score,
            written_production_score: analysisData.analysis.written_production_score,
            spoken_fluency_score: analysisData.analysis.spoken_fluency_score,
            strengths: analysisData.analysis.strengths,
            weaknesses: analysisData.analysis.weaknesses,
            recommendations: analysisData.analysis.recommendations,
            detailed_feedback: analysisData.analysis.detailed_feedback,
            progress_insights: analysisData.analysis.progress_insights,
            test_date: analysisData.analysis.test_date,
            test_provider: analysisData.analysis.test_provider,
            raw_extracted_data: analysisData.analysis
          };

          const { error: dbError } = await supabase
            .from('transcript_analyses')
            .insert(analysisRecord);

          if (dbError) throw dbError;

          setUploadProgress(100);
          
          // Check for fluency certification achievement
          const certAchieved = checkCertAchievement(
            analysisData.analysis.cefr_level,
            analysisData.analysis.overall_score
          );
          
          // Award XP for exam analysis
          console.log('📝 Awarding XP for exam analysis:', { examScore: analysisData.analysis.overall_score });
          const xpResult = await awardXP('exam_analysis', {
            examScore: analysisData.analysis.overall_score
          });
          
          // Trigger XP notification
          if (xpResult?.xpAwarded) {
            triggerXPNotification(xpResult.xpAwarded);
          }
          
          // Show cert notification if achieved (after a brief delay so XP shows first)
          if (certAchieved) {
            console.log('🎓 Fluency certification achieved:', certAchieved);
            setTimeout(() => {
              setCertType(certAchieved);
              setShowCertNotification(true);
              setTimeout(() => {
                setShowCertNotification(false);
              }, 5000);
            }, 3500); // Show cert after XP notification (3s) + small buffer
          }
          
          onUploadSuccess();

        } catch (error: any) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: error.message || "Failed to analyze transcript. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [toast, onUploadSuccess, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading || !isAuthenticated
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <>
      <CertNotification show={showCertNotification} certType={certType} />
      <Card>
      <CardHeader>
        <CardTitle>Upload Test Transcript</CardTitle>
        <CardDescription>
          Upload your language test score report (JPEG, PNG, WebP, or PDF) for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthenticated && (
          <div className="mb-4 p-3 rounded-md border border-border bg-card">
            <p className="text-sm">Please sign in to upload transcripts.</p>
            <div className="mt-2">
              <Button size="sm" onClick={() => navigate('/auth')}>Sign in</Button>
            </div>
          </div>
        )}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {isUploading ? (
            <div className="space-y-4">
              <p className="text-lg font-medium">Processing your transcript...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500">
                {uploadProgress < 25 && "Uploading file..."}
                {uploadProgress >= 25 && uploadProgress < 50 && "File uploaded, preparing analysis..."}
                {uploadProgress >= 50 && uploadProgress < 75 && "Analyzing with AI..."}
                {uploadProgress >= 75 && uploadProgress < 90 && "Extracting insights..."}
                {uploadProgress >= 90 && "Saving results..."}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your transcript here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPEG, PNG, WebP, and PDF files up to 10MB
              </p>
              <Button variant="outline">
                Select File
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-card text-card-foreground rounded-lg border border-border">
          <h4 className="font-medium mb-2">What our AI can analyze:</h4>
          <ul className="text-sm space-y-1">
            <li>• Overall scores and CEFR levels</li>
            <li>• Individual skill breakdowns (Reading, Writing, Speaking, Listening)</li>
            <li>• Strengths and areas for improvement</li>
            <li>• Progress tracking over time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default TranscriptUpload;
