
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { BookOpen, Lock, FileText, CheckSquare, Database, Clock, Trash2, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const FERPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <Alert className="mb-6">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Palavox is committed to full FERPA compliance and protecting student educational records through data minimization, encryption, and strict access controls.
        </AlertDescription>
      </Alert>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("ferpaComplianceStatement") || "FERPA & Data Privacy"}
        </h2>
        <p>
          {t("ferpaComplianceDescription") || 
            "Palavox is designed to comply fully with the Family Educational Rights and Privacy Act (FERPA), implementing strict measures to safeguard student privacy and educational data. We believe every student deserves access to language education without compromising their personal information or digital safety."}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="mr-2 h-5 w-5 text-lingua-primary" />
          What Data We Collect
        </h2>
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Educational Data (FERPA Protected):</h4>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Language practice metrics (grammar accuracy, conversation complexity)</li>
            <li>Session duration and usage statistics</li>
            <li>Certification attempt results and scores</li>
            <li>Class enrollment and assignment data</li>
            <li>Progress tracking over time</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">What We DON'T Collect:</h4>
          <ul className="list-disc pl-6 space-y-1 text-sm text-green-700 dark:text-green-300">
            <li>Student names (only display names/aliases)</li>
            <li>Home addresses or phone numbers</li>
            <li>Social Security Numbers</li>
            <li>Financial information</li>
            <li>Health records or special education status</li>
            <li>Browsing history or non-educational data</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("ferpaProtections") || "FERPA Protections"}
        </h2>
        <p>{t("ferpaProtectionsIntro") || "Palavox protects student data through the following safeguards:"}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">
            <strong>Data Minimization:</strong> {t("noPersonalInfo") || "We collect only what's necessary for educational purposes"}
          </li>
          <li className="text-base">
            <strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)
          </li>
          <li className="text-base">
            <strong>Access Control:</strong> Role-based permissions ensure only authorized educators can access student data
          </li>
          <li className="text-base">
            <strong>No Third-Party Sharing:</strong> {t("noDataSelling") || "We never sell or share data with advertisers or data brokers"}
          </li>
          <li className="text-base">
            <strong>Secure Authentication:</strong> Class codes and secure login prevent unauthorized access
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Eye className="mr-2 h-5 w-5 text-lingua-primary" />
          Data Access Audit Trail
        </h2>
        <p className="mb-2">FERPA requires educational institutions to maintain records of who accesses student data and why.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            <Badge variant="outline" className="mr-2">✅ Implemented</Badge>
            Row-level security policies prevent unauthorized database access
          </li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">✅ Implemented</Badge>
            Role-based access control limits data visibility to authorized users
          </li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 2</Badge>
            Persistent audit logging of all data access events
          </li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 2</Badge>
            Admin dashboard for reviewing access logs
          </li>
          <li className="text-base">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 2</Badge>
            Exportable compliance reports for district administrators
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-lingua-primary" />
          Data Retention Timeline
        </h2>
        <div className="space-y-3">
          <div className="border-l-4 border-lingua-primary pl-4">
            <h4 className="font-semibold">Session Data & Practice Metrics</h4>
            <p className="text-sm text-muted-foreground">
              Retained for current academic year + 1 year to track progress and improvement
            </p>
          </div>
          <div className="border-l-4 border-lingua-primary pl-4">
            <h4 className="font-semibold">Certification Results</h4>
            <p className="text-sm text-muted-foreground">
              Retained for 3 years to maintain academic records and support transcripts
            </p>
          </div>
          <div className="border-l-4 border-lingua-primary pl-4">
            <h4 className="font-semibold">Usage Statistics (Anonymized)</h4>
            <p className="text-sm text-muted-foreground">
              Aggregated after 90 days and retained indefinitely for platform improvements
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Trash2 className="mr-2 h-5 w-5 text-lingua-primary" />
          How to Request Data Deletion
        </h2>
        <p className="mb-2">
          Schools, districts, parents, or eligible students can request deletion of educational records at any time.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">To Request Data Deletion:</h4>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li>Email info@palavox.org with "DATA DELETION REQUEST" in the subject line</li>
            <li>Include: Student identifier (display name or student ID), school/district name, date range</li>
            <li>We will coordinate with your school to verify the request</li>
            <li>Data will be permanently deleted within 30 days and confirmation provided</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-3">
            <Badge variant="outline" className="mr-2">Coming Soon: Phase 4</Badge>
            Parent portal for self-service data access and deletion requests
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CheckSquare className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("yourRightsUnderFerpa") || "Your Rights Under FERPA"}
        </h2>
        <p>{t("ferpaRightsIntro") || "Under the Family Educational Rights and Privacy Act, parents and eligible students have the right to:"}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base font-medium">
            {t("ferpaRightInspectTitle") || "Inspect and Review"}
            <p className="font-normal mt-1">
              {t("ferpaRightInspect") || 
                "You may request access to any education records Palavox stores or transmits on behalf of your school or district."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightAmendTitle") || "Request Amendment"}
            <p className="font-normal mt-1">
              {t("ferpaRightAmend") || 
                "If you believe any stored data is inaccurate or misleading, you may request that it be corrected."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightConsentTitle") || "Provide or Withhold Consent"}
            <p className="font-normal mt-1">
              {t("ferpaRightConsent") || 
                "We will never share data with third parties without written consent, except as permitted by law or district guidelines."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightComplaintTitle") || "File a Complaint"}
            <p className="font-normal mt-1">
              {t("ferpaRightComplaint") || 
                "If you believe Palavox has violated your FERPA rights, you may file a complaint with the U.S. Department of Education."}
            </p>
          </li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("needMore") || "Need More?"}
        </h2>
        <p>
          {t("fullComplianceAvailable") || 
            "A detailed FERPA compliance breakdown and technical documentation are available upon request. Please email: info@palavox.org for additional information or to request documentation for your district."}
        </p>
        <p className="mt-2">
          {t("salesContactInfo") || 
            "For school or district demo requests, please contact: sales@palavox.org"}
        </p>
      </section>
    </div>
  );
};

export default FERPATabContent;
