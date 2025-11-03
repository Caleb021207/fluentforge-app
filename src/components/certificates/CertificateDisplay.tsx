import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Calendar, Shield } from "lucide-react";
import { FluencyCertLevel } from "@/utils/fluencyCertification";

interface CertificateDisplayProps {
  userName: string;
  certLevel: FluencyCertLevel;
  achievementDate: string;
}

const CertificateDisplay = ({ userName, certLevel, achievementDate }: CertificateDisplayProps) => {
  const isFunctional = certLevel === 'functional';
  const isProfessional = certLevel === 'professional';
  
  if (!certLevel) {
    return (
      <Card className="p-12 text-center">
        <div className="text-muted-foreground">
          No certificate earned yet. Complete assessments to earn your certification.
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative overflow-hidden ${isProfessional ? 'bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20' : 'bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-green-950/20 dark:via-background dark:to-teal-950/20'} border-2 ${isProfessional ? 'border-purple-200 dark:border-purple-800' : 'border-green-200 dark:border-green-800'}`}>
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
          <div className={`absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 ${isProfessional ? 'border-purple-400' : 'border-green-400'}`}></div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
          <div className={`absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 ${isProfessional ? 'border-purple-400' : 'border-green-400'}`}></div>
        </div>

        {/* Certificate Content */}
        <div className="relative p-12 space-y-8">
          {/* Header with Icon */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isProfessional ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gradient-to-br from-green-500 to-teal-500'} shadow-lg`}
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Certificate of Language Proficiency
              </h1>
              <div className={`inline-block px-4 py-2 rounded-full ${isProfessional ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'} font-semibold`}>
                {isProfessional ? 'Professionally Fluent' : 'Functionally Fluent'}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 py-8">
            <p className="text-lg text-muted-foreground">This is to certify that</p>
            <p className="text-5xl font-serif font-bold text-foreground">{userName}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              has demonstrated {isProfessional ? 'professional' : 'functional'} proficiency in language skills
              through comprehensive assessment, achieving a level equivalent to{' '}
              <span className="font-semibold text-foreground">
                {isProfessional ? 'ACTFL Advanced Low (B2)' : 'ACTFL Intermediate Mid (B1)'}
              </span>
            </p>
          </div>

          {/* Date and Seal */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>Date Achieved: {achievementDate}</span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isProfessional ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              <Shield className={`w-5 h-5 ${isProfessional ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
              <span className={`font-semibold ${isProfessional ? 'text-purple-700 dark:text-purple-300' : 'text-green-700 dark:text-green-300'}`}>
                Palavox Certified
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Important: Assessment Information
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Purpose:</strong> Palavox Cert assessments are designed for self-assessment, progress tracking, and placement guidance. While we use AI-powered testing for accurate evaluation, results may contain inaccuracies and should be used as guidance rather than definitive measures.
              </p>
              <p>
                <strong className="text-foreground">Certification Status:</strong> Palavox Cert does not issue official, accredited language certifications. The proficiency levels indicated in your results represent our assessment of your capabilities. We believe that with the same level of honest effort and performance, you would be capable of achieving similar results on accredited examinations (such as ACTFL, CEFR-aligned tests, or similar official assessments).
              </p>
              <p>
                <strong className="text-foreground">For Official Certification:</strong> For official certification purposes (immigration, academic credit, professional licensing), please consult accredited testing organizations.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CertificateDisplay;
