import React from "react";
import { CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ComplianceStatusTabContent = () => {
  const phases = [
    {
      phase: "Phase 0: Security Hardening",
      status: "complete",
      items: [
        "Database role immutability",
        "RLS policy enforcement",
        "Server-side authorization",
        "Secure API endpoints"
      ]
    },
    {
      phase: "Phase 1: Documentation & Audit",
      status: "in-progress",
      items: [
        "Access control mapping",
        "FERPA/CIPA compliance checklist",
        "Risk assessment matrix",
        "Security policy documentation"
      ]
    },
    {
      phase: "Phase 2: FERPA Audit Logging",
      status: "planned",
      week: "Week 2",
      items: [
        "Persistent audit log database",
        "Admin dashboard for reviewing access",
        "Export functionality for compliance reports",
        "Automated anomaly detection"
      ]
    },
    {
      phase: "Phase 3: Enhanced CIPA Protection",
      status: "planned",
      week: "Week 3",
      items: [
        "Content flagging system",
        "Report button in chat interface",
        "Teacher moderation dashboard",
        "Real-time content monitoring alerts"
      ]
    },
    {
      phase: "Phase 4: Consent Management",
      status: "planned",
      week: "Week 4",
      items: [
        "Database-backed parental consent",
        "Consent revocation workflow",
        "Parent portal access",
        "Automated consent reminders"
      ]
    },
    {
      phase: "Phase 5: Testing & Validation",
      status: "planned",
      week: "Week 5",
      items: [
        "Automated security testing",
        "Performance benchmarks",
        "End-to-end compliance testing",
        "Load testing for peak usage"
      ]
    },
    {
      phase: "Phase 6: Third-Party Certification",
      status: "planned",
      week: "Week 6",
      items: [
        "External security audit",
        "Penetration testing",
        "Official compliance certificates",
        "SOC 2 Type II preparation"
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "planned":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Complete</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">🔄 In Progress</Badge>;
      case "planned":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">📅 Planned</Badge>;
      default:
        return null;
    }
  };

  const completedPhases = phases.filter(p => p.status === "complete").length;
  const progressPercentage = Math.round((completedPhases / phases.length) * 100);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This page shows our transparent compliance roadmap. We believe in showing you exactly where we are in our compliance journey, what's implemented, and what's planned.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Overall Compliance Progress</CardTitle>
          <CardDescription>
            {completedPhases} of {phases.length} phases complete ({progressPercentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-lingua-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Estimated completion: 6 weeks from start date
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(phase.status)}
                  <div>
                    <CardTitle className="text-lg">{phase.phase}</CardTitle>
                    {phase.week && (
                      <CardDescription className="mt-1">
                        Timeline: {phase.week}
                      </CardDescription>
                    )}
                  </div>
                </div>
                {getStatusBadge(phase.status)}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Questions About Our Compliance Status?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            For detailed technical documentation or to request a compliance packet for your district, please contact:
          </p>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              General Inquiries: <a href="mailto:info@palavox.org" className="text-lingua-primary hover:underline">info@palavox.org</a>
            </p>
            <p className="text-sm font-medium">
              District Sales & Demos: <a href="mailto:sales@palavox.org" className="text-lingua-primary hover:underline">sales@palavox.org</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceStatusTabContent;
