import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ComplianceFAQ = () => {
  const faqs = [
    {
      question: "Is Palavox approved for my school district?",
      answer: "Palavox is designed to meet CIPA and FERPA compliance standards. We work directly with school districts to ensure our platform meets their specific requirements. Contact us at sales@palavox.org to discuss your district's needs and approval process."
    },
    {
      question: "What happens if inappropriate content is detected?",
      answer: "Our multi-layered content filtering system automatically blocks inappropriate content in real-time. This includes keyword filtering, AI-based content moderation, and contextual analysis. Blocked content is logged for review by administrators. In Phase 3 of our roadmap, we're adding a student report button and teacher moderation dashboard for enhanced oversight."
    },
    {
      question: "Can parents opt their children out?",
      answer: "Yes. Parents who do not want their child to use Palavox must notify their school in writing. Schools can then mark students as opted-out in our system. We're building a parent portal (Phase 4) to make this process even easier."
    },
    {
      question: "How do I request my child's data?",
      answer: "Under FERPA, parents and eligible students have the right to inspect educational records. To request data, please email info@palavox.org with your request. We will coordinate with your school district to provide the information within the timeframe required by law (typically 45 days)."
    },
    {
      question: "What is FERPA/CIPA and why does it matter?",
      answer: "FERPA (Family Educational Rights and Privacy Act) protects the privacy of student education records. CIPA (Children's Internet Protection Act) requires schools to filter internet content and protect students from harmful online material. These federal laws ensure that educational technology platforms like Palavox maintain high standards for student safety and data privacy."
    },
    {
      question: "How often are security audits performed?",
      answer: "We conduct internal security audits continuously as part of our development process. We're planning for external third-party security audits and penetration testing in Phase 6 of our compliance roadmap. Once completed, we will pursue SOC 2 Type II certification and regular annual audits."
    },
    {
      question: "What data does Palavox collect?",
      answer: "We collect minimal data necessary for the platform to function: language practice metrics (grammar accuracy, conversation complexity), usage statistics (session duration, feature usage), and certification attempt results. We do NOT collect: names, addresses, phone numbers, social security numbers, financial information, or any personally identifiable information (PII)."
    },
    {
      question: "How long is student data retained?",
      answer: "Session data: Retained for the current academic year plus one year for progress tracking. Usage metrics: Anonymized and aggregated after 90 days. Certification results: Retained for 3 years for academic records. Schools or districts can request deletion of all data at any time by contacting info@palavox.org."
    },
    {
      question: "Does Palavox sell student data?",
      answer: "Absolutely not. We do not sell, rent, or share student data with third parties, advertisers, or data brokers. Student data is used solely to provide and improve our educational services. This is a core principle of our platform and is non-negotiable."
    },
    {
      question: "How do I report a security concern?",
      answer: "If you believe you've discovered a security vulnerability or have concerns about student safety, please email info@palavox.org immediately with 'SECURITY CONCERN' in the subject line. We take all reports seriously and will respond within 24 hours."
    }
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>
          Common questions about our compliance, security, and data practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ComplianceFAQ;
