
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Upload, FileImage, FileText, File } from "lucide-react";

interface TranscriptUploadProps {
  onUploadSuccess: () => void;
}

const TranscriptUpload: React.FC<TranscriptUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
const { toast } = useToast();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        title: t("fileTooLarge") || "File too large",
        description: t("fileMaxSize") || "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t("invalidFileType") || "Invalid file type",
        description: t("supportedFileTypes") || "Please upload a JPEG, PNG, WebP, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Ensure authenticated session before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signOut();
      toast({
        title: t("sessionExpired") || "Session expired",
        description: t("pleaseSignInAgain") || "Please sign in again to upload transcripts.",
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
            reading_score: analysisData.analysis.reading_score,
            writing_score: analysisData.analysis.writing_score,
            speaking_score: analysisData.analysis.speaking_score,
            listening_score: analysisData.analysis.listening_score,
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
          onUploadSuccess();

        } catch (error: any) {
          console.error('Analysis error:', error);
          toast({
            title: t("analysisFailed") || "Analysis failed",
            description: error.message || t("failedToAnalyzeTranscript") || "Failed to analyze transcript. Please try again.",
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
        title: t("uploadFailed") || "Upload failed",
        description: error.message || t("failedToUploadFile") || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [toast, onUploadSuccess, t]);

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
    <Card>
      <CardHeader>
        <CardTitle>{t("uploadTestTranscript")}</CardTitle>
        <CardDescription>
          {t("uploadLanguageTestScoreReport")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthenticated && (
          <div className="mb-4 p-3 rounded-md border border-border bg-card">
            <p className="text-sm">{t("pleaseSignInToUpload") || "Please sign in to upload transcripts."}</p>
            <div className="mt-2">
              <Button size="sm" onClick={() => navigate('/auth')}>{t("signIn") || "Sign in"}</Button>
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
              <p className="text-lg font-medium">{t("processingTranscript") || "Processing your transcript..."}</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500">
                {uploadProgress < 25 && (t("uploadingFile") || "Uploading file...")}
                {uploadProgress >= 25 && uploadProgress < 50 && (t("fileUploadedPreparing") || "File uploaded, preparing analysis...")}
                {uploadProgress >= 50 && uploadProgress < 75 && (t("analyzingWithAI") || "Analyzing with AI...")}
                {uploadProgress >= 75 && uploadProgress < 90 && (t("extractingInsights") || "Extracting insights...")}
                {uploadProgress >= 90 && (t("savingResults") || "Saving results...")}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? (t("dropTranscriptHere") || 'Drop your transcript here') : (t("dragDropOrClickToUpload") || 'Drag & drop or click to upload')}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t("supportsFileFormats")}
              </p>
              <Button variant="outline">
                {t("selectFile")}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-card text-card-foreground rounded-lg border border-border">
          <h4 className="font-medium mb-2">{t("whatOurAiCanAnalyze")}</h4>
          <ul className="text-sm space-y-1">
            <li>{t("overallScoresAndCefrLevels")}</li>
            <li>{t("individualSkillBreakdowns")}</li>
            <li>{t("strengthsAndAreasForImprovement")}</li>
            <li>{t("progressTrackingOverTime")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptUpload;
