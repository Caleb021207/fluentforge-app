
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, Users, AlertTriangle, Eye, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const CIPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Palavox maintains active CIPA-compliant content filtering to protect students from inappropriate material during all learning sessions.
        </AlertDescription>
      </Alert>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("contentFiltering") || "Content Filtering"}
        </h2>
        <p className="mb-4">{t("cipaComplianceDescription") || "Palavox maintains a safe digital learning space through the following features:"}</p>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Badge variant="outline">Active Protection</Badge>
            Filtered Content Categories
          </h4>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Violence and violent language</li>
            <li>Substance abuse references (drugs, alcohol, tobacco)</li>
            <li>Adult/mature content</li>
            <li>Discriminatory or hate speech</li>
            <li>Profanity and obscene language</li>
            <li>Gambling and dating content</li>
          </ul>
        </div>

        <h4 className="font-medium mt-4 mb-2">How We Filter Content:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            <strong>Real-time AI Moderation:</strong> Every AI tutor conversation is analyzed by OpenAI's GPT models with strict safety guidelines that prevent inappropriate responses
          </li>
          <li className="text-base">
            <strong>Keyword Filtering:</strong> Automated detection of prohibited terms and phrases in multiple languages
          </li>
          <li className="text-base">
            <strong>Contextual Analysis:</strong> Understanding context to prevent false positives while maintaining safety
          </li>
          <li className="text-base">
            <strong>No External Content:</strong> {t("cipaNoExternalContent") || "No access to external search engines, media, or third-party websites"}
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-lingua-primary" />
          Reporting Inappropriate Content
        </h2>
        <p className="mb-2">If students encounter any content that seems inappropriate:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">Students should immediately stop using the platform and notify their teacher</li>
          <li className="text-base">Teachers can report issues to their school administrator</li>
          <li className="text-base">Schools can contact us at info@palavox.org with details</li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 3</Badge>
            In-app report button for students and teachers
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Eye className="mr-2 h-5 w-5 text-lingua-primary" />
          Teacher & Administrator Oversight
        </h2>
        <p className="mb-2">Educators have multiple ways to monitor student activity:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">View student usage metrics and session durations</li>
          <li className="text-base">Monitor certification attempts and progress</li>
          <li className="text-base">Access aggregated class-wide usage reports</li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 3</Badge>
            Teacher moderation dashboard with session review capabilities
          </li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 3</Badge>
            Real-time alerts for flagged content or unusual activity
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("parentalControls") || "Parental & Educator Controls"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("parentalControlsPoint1") || "PIN-protected settings to prevent unauthorized changes"}</li>
          <li className="text-base">{t("parentalControlsPoint2") || "Optional screen time limits for students"}</li>
          <li className="text-base">{t("parentalControlsPoint3") || "Adjustable content levels by age or proficiency"}</li>
          <li className="text-base">Age verification for users under 13 (requires parental consent)</li>
          <li className="text-base">District-wide policy enforcement capabilities</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("userSafetyTips") || "Student Safety Reminders"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("userSafetyTip1") || "Never share personal information with AI assistants"}</li>
          <li className="text-base">{t("userSafetyTip2") || "Report any inappropriate content immediately"}</li>
          <li className="text-base">{t("userSafetyTip3") || "Under 13? Use with adult supervision"}</li>
          <li className="text-base">{t("userSafetyTip4") || "Take breaks during long sessions"}</li>
          <li className="text-base">Focus on learning—the AI tutor is here to help you practice language skills</li>
        </ul>
      </section>
    </div>
  );
};

export default CIPATabContent;
