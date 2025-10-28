import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
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
              <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">PALAVOX</h1>
                  <h2 className="text-2xl font-semibold">Palavox Legal Documents</h2>
                </div>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">End‑User License Agreement (EULA)</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: October 22, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Definitions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>"Software" refers to the Palavox language learning and testing platform, including all associated websites, mobile applications, data, code, documentation, content, and services.</li>
                  <li>"User" or "You" refers to any individual or entity that downloads, accesses, or uses the Software, including students, teachers, school administrators and parents.</li>
                  <li>"Licensee" refers to the individual or entity accepting this EULA. By downloading, installing, or using the Software, you accept and agree to be bound by this EULA.</li>
                  <li>"Company" refers to Palavox, owned and operated by Caleb Jaworski, 2024‑2025.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Grant of License</h3>
                <p className="mb-3"><strong>Non‑Exclusive License.</strong> Subject to compliance with this EULA, the Company grants the Licensee a personal, non‑transferable, non‑exclusive, revocable license to access and use the Software for educational purposes. No title or ownership is transferred to the Licensee.</p>
                <p className="mb-3"><strong>Permitted Uses.</strong> The Software may be used to provide language instruction, assessment, and certification for K‑12 learners. You may access the Software through a web browser or an approved client application.</p>
                <p className="mb-3"><strong>Prohibited Uses.</strong> You shall not:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Copy, modify, distribute, sell, sublicense, or commercially exploit the Software without prior written consent.</li>
                  <li>Reverse‑engineer, decompile, disassemble or otherwise attempt to discover source code or underlying algorithms.</li>
                  <li>Circumvent any security or technical protection measures.</li>
                  <li>Use the Software for non‑educational, illegal, or harmful purposes, including distributing test questions publicly or aiding cheating.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Intellectual Property Rights</h3>
                <p className="mb-3"><strong>Ownership.</strong> The Software, including its source code, architecture, content (test passages, questions, prompts, audio, UI designs), trademarks, and logos are the exclusive property of the Company and its licensors. Your use of the Software does not confer ownership rights.</p>
                <p className="mb-3"><strong>User Content.</strong> You retain ownership of any original responses, recordings, or materials you create. By submitting User Content, you grant the Company a worldwide, royalty‑free license to use, reproduce, and display such content solely to operate and improve the Software.</p>
                <p className="mb-3"><strong>Feedback.</strong> If you submit feedback, comments or suggestions, you grant the Company a perpetual, irrevocable, royalty‑free right to use such feedback without obligation.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Term and Termination</h3>
                <p className="mb-3"><strong>Term.</strong> This license is effective until terminated. You may terminate it at any time by deleting your account and ceasing all use of the Software. The Company may suspend or terminate your license for breach of this EULA or the Terms of Service.</p>
                <p className="mb-3"><strong>Effect of Termination.</strong> Upon termination, your right to use the Software ceases. Your data will be retained or deleted according to our Privacy Policy. Sections relating to Intellectual Property, Disclaimers, Limitation of Liability, and Governing Law survive termination.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Disclaimers</h3>
                <p className="mb-3"><strong>No Warranty.</strong> The Software is provided "as is" and "as available" without warranties of any kind. The Company disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose and non‑infringement. We do not guarantee uninterrupted service or error‑free content.</p>
                <p className="mb-3"><strong>No Guarantee of Outcomes.</strong> Language proficiency scores generated by the Software are assessments and do not guarantee admission to educational programs, employment, or other outcomes.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Limitation of Liability</h3>
                <p className="mb-4">To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of or relating to your use of the Software. In no event shall the Company's aggregate liability exceed the greater of $100 or the amount you paid for use of the Software during the twelve months preceding the claim.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Governing Law and Dispute Resolution</h3>
                <p className="mb-4">This EULA is governed by the laws of the State of Alabama, USA, without regard to conflict-of-laws principles. Any dispute arising under this EULA shall be resolved through informal negotiation, followed by mediation or binding arbitration in Jackson County, Alabama. The prevailing party is entitled to recover reasonable attorney's fees and costs.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Entire Agreement</h3>
                <p className="mb-4">This EULA constitutes the entire agreement between you and the Company regarding the Software, superseding all prior understandings. If any provision is held invalid, the remaining provisions remain in full force.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Contact</h3>
                <p className="mb-4">For questions regarding this EULA, contact info@palavox.org.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">Terms of Service (ToS)</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: October 22, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Acceptance</h3>
                <p className="mb-4">By accessing or using the Palavox platform, you agree to these Terms of Service. If you do not agree, do not use the platform. These Terms apply to all Users, including students, teachers, parents, school administrators, and visitors.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Accounts and Eligibility</h3>
                <p className="mb-3"><strong>Minimum Age.</strong> To create an account, you must be at least eight (8) years old. If you are under 13, a parent or legal guardian must provide consent and supervise your use of the platform. This requirement aligns with the Children's Online Privacy Protection Act (COPPA), which requires verifiable parental consent before collecting personal information from children under 13.</p>
                <p className="mb-3"><strong>Registration.</strong> You must provide a valid email address and create a password. All information provided must be accurate and kept up to date.</p>
                <p className="mb-3"><strong>Account Security.</strong> You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. User Responsibilities</h3>
                <p className="mb-3"><strong>Educational Use.</strong> The platform is for educational language practice, assessment, and certification. You agree not to use the platform for commercial purposes or any non‑educational activity.</p>
                <p className="mb-3"><strong>Content.</strong> Do not upload or submit content that is unlawful, obscene, defamatory, harassing, hate speech, or otherwise inappropriate. The platform uses content filtering and moderation to block obscene or harmful content and to comply with the Children's Internet Protection Act (CIPA).</p>
                <p className="mb-3"><strong>Prohibited Conduct.</strong> Users shall not:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Cheat, share test answers or certification codes, or use bots to complete assessments.</li>
                  <li>Attempt to circumvent security measures or interfere with the platform's operation.</li>
                  <li>Impersonate another person or provide false information.</li>
                  <li>Attempt to gain unauthorized access to other users' accounts or data.</li>
                  <li>Share personal information of children under 13 without parental consent.</li>
                </ul>
                <p className="mb-3"><strong>Teacher and Admin Obligations.</strong> Teachers and school administrators must ensure that students use the platform in accordance with school policies and applicable law, including FERPA and CIPA requirements. They must not provide students with access to inappropriate material and must ensure proper parental consent for minors.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Platform Features</h3>
                <p className="mb-3"><strong>Testing and Assessment.</strong> The platform offers multi‑phase tests covering comprehension (reading and listening), writing, and conversational fluency. Scores are aligned to the Common European Framework of Reference (CEFR) and other frameworks (STAMP and ACTFL). The tests may adapt in difficulty based on user performance.</p>
                <p className="mb-3"><strong>Learning Modules.</strong> Users may access practice lessons, flashcards, sentence‑building exercises, and guided conversations. As part of the gamified curriculum, users earn points and achievements.</p>
                <p className="mb-3"><strong>Voice and Translation.</strong> The platform integrates voice synthesis and transcription (using third‑party services) to provide spoken feedback and translations.</p>
                <p className="mb-3"><strong>Data Usage.</strong> See the Privacy Policy for details on data collection and usage.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Payment (if applicable)</h3>
                <p className="mb-4">Currently the platform is free for schools and educational institutions. If pricing changes, you will be notified at least 60 days in advance.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Suspension and Termination</h3>
                <p className="mb-4">We may suspend or terminate your account for violations of these Terms, including prohibited conduct, abuse, or fraud. Teachers and administrators may suspend student accounts at their discretion. Upon termination, you remain liable for obligations incurred prior to termination.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Disclaimers and Limitation of Liability</h3>
                <p className="mb-3"><strong>Service "As Is."</strong> We do not guarantee that the platform will operate without interruption or error. We are not responsible for third‑party services' availability (e.g., OpenAI, Azure, Google, Stripe). The platform may contain errors or inaccuracies.</p>
                <p className="mb-3"><strong>No Liability for Decisions.</strong> We are not liable for any decisions made by schools or third parties based on test scores or certifications. We do not guarantee admission or placement outcomes.</p>
                <p className="mb-3"><strong>Limitation.</strong> Our total liability to you will not exceed $100 or the fees you paid to us in the past twelve months.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Indemnification</h3>
                <p className="mb-4">You agree to indemnify and hold harmless the Company and its officers, employees, and affiliates from any claims or damages arising out of your use of the platform, violation of these Terms, or violation of any rights of others.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Modifications</h3>
                <p className="mb-4">We may modify these Terms. Material changes will be notified by email and on our website at least 30 days before the effective date. Continued use after the effective date constitutes acceptance of the new Terms.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. Governing Law</h3>
                <p className="mb-4">These Terms are governed by the laws of the State of Alabama, USA, without regard to conflict-of-laws principles. Disputes shall be resolved as described in the EULA.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11. Contact</h3>
                <p className="mb-4">For support or questions, email info@palavox.org.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
                <p className="text-sm text-muted-foreground mb-6">Effective Date: October 22, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Scope</h3>
                <p className="mb-4">This Privacy Policy describes how Palavox collects, uses, shares, and protects personal information. It applies to all users (students, parents, teachers, administrators, and visitors) of the platform.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information.</strong> We collect your email address and, optionally, a display name when you create an account.</li>
                  <li><strong>Usage and Performance Data.</strong> This includes language preferences, test responses, audio recordings, written submissions, progress metrics, duration of sessions, number of attempts, scores, and certification data.</li>
                  <li><strong>Device and Connection Information.</strong> We collect IP addresses, browser type, and device identifiers for security, troubleshooting, and analytics.</li>
                  <li><strong>Cookies and Similar Technologies.</strong> We use cookies or local storage to maintain your session and track aggregate usage metrics. For details, see our Cookie Policy.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. How We Use Data</h3>
                <p className="mb-3"><strong>Platform Operation and Improvement.</strong> We use your data to deliver language assessment and learning services, personalize content based on your CEFR level, and improve our products.</p>
                <p className="mb-3"><strong>Scoring and Feedback.</strong> Your responses and recordings are processed by automated systems (including AI models) to generate scores and feedback. The scoring uses a framework based on STAMP methodology and CEFR alignment.</p>
                <p className="mb-3"><strong>Analytics.</strong> Aggregated and de‑identified data may be used for analytics to improve content, measure performance, and produce aggregated statistics.</p>
                <p className="mb-3"><strong>Communication.</strong> We may use your email to send account notifications, test results, updates about changes to our policies, or necessary disclosures.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Educational Records & FERPA</h3>
                <p className="mb-3">Palavox is used by educational institutions and collects education records. Under FERPA, parents (or eligible students age 18+) have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Access to Education Records:</strong> Schools must allow parents to inspect and review their child's education records within 45 calendar days of a request. Palavox assists schools by providing secure portals for this purpose.</li>
                  <li><strong>Amendment of Records:</strong> Parents may request corrections of inaccurate or misleading records. If a school denies the request, parents may insert a statement into the record explaining their disagreement.</li>
                  <li><strong>Consent to Disclosure:</strong> Schools generally may not disclose personally identifiable information (PII) without written parental consent, except to school officials with a legitimate educational interest or in other limited circumstances. "Directory information" may be disclosed unless parents opt out. Palavox does not independently designate or disclose directory information.</li>
                </ul>
                <p className="mb-4">Palavox stores education records on behalf of schools and operates under their direct control. Our access to records is limited to fulfilling educational services.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Children's Privacy (COPPA)</h3>
                <p className="mb-4">Palavox does not knowingly collect personal information from children under 13 without verifiable parental consent. COPPA requires operators to obtain verifiable parental consent before collecting personal information from children under 13. When Palavox is used in schools, the school may provide consent on behalf of parents when acting as the parent's agent for educational use. Parents may review, delete, and refuse further collection of their child's information at any time. If consent is not obtained in a reasonable time after notice, we delete the data.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. CIPA Support</h3>
                <p className="mb-4">For schools receiving E‑Rate funding, CIPA requires them to adopt an Internet safety policy and implement a technology protection measure that blocks access to content that is obscene, child pornography, or harmful to minors. Palavox supports compliance with safety filters and teacher controls but does not replace the school's own filtering obligations.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Data Sharing</h3>
                <p className="mb-3"><strong>With Schools.</strong> We share students' test results and progress metrics with the respective schools and teachers to enable educational evaluation.</p>
                <p className="mb-3"><strong>With Parents/Guardians.</strong> Parents can access their child's data through the school or the parent portal with proper authorization.</p>
                <p className="mb-3"><strong>With Service Providers.</strong> We share data with third‑party AI providers (e.g., OpenAI, Azure, Google) solely to process user responses and generate scores. We require these providers to adhere to data security obligations and not to use data for unrelated purposes.</p>
                <p className="mb-3"><strong>With Law Enforcement.</strong> We may disclose data as required by law or to protect our rights or safety. When disclosing under FERPA exceptions, we ensure compliance with § 99.31 and its conditions.</p>
                <p className="mb-3"><strong>Directory Information.</strong> Schools may designate certain data as "directory information" and disclose it without consent unless parents opt out. Palavox does not independently designate or disclose directory information.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Data Retention</h3>
                <p className="mb-4">Test responses, transcripts, and progress metrics are retained as required by FERPA and school agreements. Audio recordings are retained for evaluation, review, and improvement for a limited period before deletion. Users may request deletion of their data through their school.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Security Measures</h3>
                <p className="mb-4">We use industry‑standard encryption (AES‑256 at rest and TLS 1.3 in transit) and role‑based access control (RLS) to protect data. Access to student records is audited. We follow the U.S. Department of Education's guidelines for safeguarding PII and maintain confidentiality with service providers.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. International Users and GDPR</h3>
                <p className="mb-4">For international users (e.g., in the European Economic Area), we adhere to local data protection laws and may enter into Standard Contractual Clauses where personal data is transferred to the U.S. Data subjects outside the U.S. may have additional rights, including the right to be forgotten and data portability.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11. Your Rights</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Access and Correction:</strong> You may request to review and correct your personal information.</li>
                  <li><strong>Opt‑Out:</strong> You may request that your data not be used for analytics or research, subject to legal and contractual requirements.</li>
                  <li><strong>Deletion:</strong> You may request deletion of your personal information to the extent permitted by law. Some data may be retained for record‑keeping and compliance.</li>
                  <li><strong>Directory Information Opt‑Out:</strong> Parents may opt out of the disclosure of directory information by notifying their child's school.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">12. Changes to this Policy</h3>
                <p className="mb-4">We may update this Privacy Policy. Material changes will be communicated via email and on our website. Continued use of the platform constitutes acceptance of the new policy.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">13. Contact Us</h3>
                <p className="mb-4">For questions about this Privacy Policy or to exercise data rights, contact info@palavox.org.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">School Service Agreement</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: October 22, 2025</p>
                <p className="mb-4">This Agreement ("Agreement") is between Palavox ("Service Provider") and the school or educational institution accepting these terms ("School"). It sets out the conditions under which Palavox provides language assessment and learning services.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Scope of Services</h3>
                <p className="mb-4">Palavox offers an AI‑powered platform for language learning and certification. The Services include test administration, scoring, analytics, and classroom management tools.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. FERPA & Data Processing</h3>
                <p className="mb-3"><strong>Data Processor Role.</strong> Palavox acts as the School's data processor and a "school official" under the School's direct control. We use student data only to provide and improve the Services. We will not redisclose personally identifiable information from education records except as permitted under FERPA (e.g., to authorized school officials with legitimate educational interests).</p>
                <p className="mb-3"><strong>Security.</strong> We implement encryption, role‑based access controls, and row‑level security to ensure that only authorized personnel have access. We maintain a security audit log and allow schools to audit our compliance.</p>
                <p className="mb-3"><strong>Access, Amendment, and Disclosure.</strong> Palavox will assist the School in fulfilling FERPA requests, including providing access to records within 45 days and recording amendments or statements of disagreement.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Responsibilities of the School</h3>
                <p className="mb-3"><strong>Parental Consent.</strong> The School must obtain all necessary parental consent under COPPA and FERPA before allowing students under 13 to use the platform.</p>
                <p className="mb-3"><strong>Internet Safety.</strong> If the School receives E‑Rate funding, it must ensure that an Internet safety policy and filtering measures are in place to block obscene or harmful content as required by CIPA.</p>
                <p className="mb-3"><strong>Account Supervision.</strong> The School shall manage teacher and student accounts, monitor usage, and provide support to users.</p>
                <p className="mb-3"><strong>Certification Codes.</strong> The School will issue certification codes and track usage. Misuse or unauthorized sharing of certification codes must be addressed promptly.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Confidentiality and Disclosure</h3>
                <p className="mb-3"><strong>Confidentiality.</strong> Both parties will maintain the confidentiality of education records and other proprietary information. Neither party will disclose confidential information to third parties except as required by law.</p>
                <p className="mb-3"><strong>Directory Information.</strong> Schools may designate certain information as directory information. Palavox will not disclose directory information unless instructed by the School and only after parents have been given the opportunity to opt out.</p>
                <p className="mb-3"><strong>Sub‑processors.</strong> Palavox may engage sub‑processors (e.g., AI providers) under written agreements that require them to implement equivalent data protection.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Term and Termination</h3>
                <p className="mb-4">This Agreement remains in effect for one year or until terminated by either party. Either party may terminate for material breach. Upon termination, Palavox will assist the School in transferring or deleting student data in accordance with FERPA.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Indemnity and Liability</h3>
                <p className="mb-4">Each party indemnifies the other against third‑party claims arising from its breach of this Agreement or violation of applicable laws. Neither party shall be liable for indirect or consequential damages.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Notices</h3>
                <p className="mb-4">All notices under this Agreement must be provided in writing to the contacts designated by each party.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">FERPA Compliance Statement</h2>
                <p className="mb-4">Palavox is committed to protecting the privacy of student education records in accordance with the Family Educational Rights and Privacy Act (FERPA) and applicable state laws. Key elements of our FERPA compliance program include:</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Access Rights</h3>
                <p className="mb-4">We work with schools to ensure parents may inspect and review their child's education records within 45 days of a request. Our platform provides secure portals for parents, where authorized by the school, to access records.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Amendment Rights</h3>
                <p className="mb-4">We support schools in responding to requests to correct or amend records that parents believe are inaccurate or misleading. If a record is not amended, parents can insert a statement of disagreement, which we attach to the record.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Consent for Disclosure</h3>
                <p className="mb-4">We do not share personally identifiable information from education records without written consent, except as permitted by FERPA. Schools may disclose PII to school officials with legitimate educational interests, contractors and service providers under the direct control of the school, or new schools in which the student seeks to enroll. We assist schools in tracking consent and documenting disclosures.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Directory Information</h3>
                <p className="mb-4">We do not designate directory information on our own. Schools determine what constitutes directory information and notify parents of the right to opt out.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Security Measures</h3>
                <p className="mb-4">Our database uses encryption at rest and in transit, role‑based access control, audit logs, and row‑level security. We restrict access to authorized school officials with legitimate educational interests.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Record of Disclosures</h3>
                <p className="mb-4">We maintain logs of disclosures of education records as required by FERPA so that parents or eligible students may review the record of disclosures.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Training and Awareness</h3>
                <p className="mb-4">Employees handling education records receive annual training on FERPA requirements and privacy best practices. We require confidentiality agreements from employees and contractors with access to student data.</p>
                <p className="mb-4">For questions about our FERPA compliance, contact info@palavox.org.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">COPPA Notice (Parental Consent Requirements)</h2>
                <p className="mb-4">Palavox complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13 unless a parent or guardian has provided verifiable parental consent.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect from Children</h3>
                <p className="mb-4">With parental consent, we collect: email address, language preferences, audio recordings of spoken responses, written test answers, and session usage statistics. We may also collect parent contact information for consent purposes. We do not request names, addresses, or other unnecessary personal identifiers.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. How We Use Children's Information</h3>
                <p className="mb-4">We use children's information only to provide language learning and assessment services, generate scores, and deliver feedback. We do not disclose personal information to third parties except to service providers under contract who process information solely to provide services to us.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Parental Rights</h3>
                <p className="mb-3">Parents have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Review and Request Deletion.</strong> Parents may review their child's personal information, request deletion, and refuse to permit further collection or use of the child's information.</li>
                  <li><strong>Consent.</strong> We require verifiable parental consent before collecting any personal information from children under 13. Exceptions include collecting a parent's contact information solely to provide notice or collecting persistent identifiers solely for internal operations.</li>
                  <li><strong>Choice.</strong> Parents may consent to collection of information but refuse disclosure to third parties. We will comply with their choices.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. How to Provide Consent</h3>
                <p className="mb-4">We allow schools and parents to provide consent using methods recommended by the FTC, including email plus (parent responds to notice via email), paper forms, or video calls. If consent is not obtained, we delete the child's information.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Contact for COPPA Questions</h3>
                <p className="mb-4">For questions about COPPA compliance or to exercise parental rights, email info@palavox.org.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">Cookie Policy</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. What Are Cookies?</h3>
                <p className="mb-4">Cookies are small text files stored on your device when you visit websites. We use cookies and similar technologies (e.g., local storage) to provide and improve the Palavox platform.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. How We Use Cookies</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Essential Cookies.</strong> These cookies are necessary for the platform to function. They authenticate users and maintain sessions.</li>
                  <li><strong>Analytics Cookies.</strong> We use first-party analytics to understand how users engage with the platform. These cookies collect aggregated, anonymous data.</li>
                  <li><strong>Functionality Cookies.</strong> These cookies remember your language and interface preferences.</li>
                  <li><strong>No Advertising Cookies.</strong> We do not use cookies for targeted advertising.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Managing Cookies</h3>
                <p className="mb-4">You can manage cookie preferences through your browser settings. However, disabling essential cookies may affect your ability to use the platform. By using our platform, you consent to the use of cookies as described in this policy.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">Acceptable Use Policy</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Purpose</h3>
                <p className="mb-4">This Acceptable Use Policy sets standards for the proper use of the Palavox platform to ensure a safe and productive environment.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Permitted Uses</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Educational Activities.</strong> Using the platform for language learning, practice, and assessment.</li>
                  <li><strong>Academic Research.</strong> Teachers and researchers may use anonymized data for educational research with appropriate permissions.</li>
                  <li><strong>Parent Engagement.</strong> Parents may access their child's progress and participate in consent processes.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Prohibited Conduct</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Unlawful Activities.</strong> Using the platform in violation of any applicable law or regulation, including but not limited to copyright laws and privacy regulations.</li>
                  <li><strong>Content Violations.</strong> Uploading, posting, or sharing content that is obscene, violent, defamatory, harassing, hate speech, pornographic, or otherwise harmful. Schools must block access to content that is obscene, harmful to minors or considered child pornography when subject to CIPA. Palavox supports safety filters but does not replace the school's legal duty.</li>
                  <li><strong>Cheating and Academic Misconduct.</strong> Sharing answers, test questions, or certification codes; using bots or external help during assessments; or collaborating on individual assessments.</li>
                  <li><strong>Security Violations.</strong> Attempting to circumvent security measures, introduce malware, or access accounts without authorization.</li>
                  <li><strong>Data Misuse.</strong> Collecting personal information about other users, redisclosing test content, or misusing personal data.</li>
                  <li><strong>Misrepresentation.</strong> Impersonating another person or misrepresenting your affiliation.</li>
                  <li><strong>Commercial Use.</strong> Selling, licensing, or otherwise commercializing platform access or content without authorization.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Enforcement</h3>
                <p className="mb-4">Violation of this policy may result in suspension or termination of your account and notification of your school or legal authorities. Repeat violations may result in permanent bans.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Reporting</h3>
                <p className="mb-4">Users should report violations or concerns by contacting info@palavox.org or through the in‑app report feature.</p>

                <Separator className="my-8" />

                <h2 className="text-2xl font-bold mb-4">Legal Citations Appendix</h2>
                <p className="mb-3">For transparency and verifiability, the following references informed our policies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>FERPA</strong> – Family Educational Rights and Privacy Act, 20 U.S.C. § 1232g; 34 C.F.R. Part 99. See the U.S. Department of Education's Student Privacy Policy Office guidance on parental rights to inspect records within 45 days, amend records, and control disclosure of personally identifiable information.</li>
                  <li><strong>COPPA</strong> – Children's Online Privacy Protection Act, 15 U.S.C. § 6501–6506; 16 C.F.R. Part 312 (FTC COPPA Rule). See the FTC's guidance for verifiable parental consent methods and parental rights.</li>
                  <li><strong>CIPA</strong> – Children's Internet Protection Act, 47 U.S.C. § 254(h)(5). Schools receiving E‑Rate funds must adopt an Internet safety policy and deploy a technology protection measure blocking access to obscene, child-pornographic, or harmful-to-minors content.</li>
                  <li><strong>Directory Information</strong> – Schools determine what constitutes directory information and notify parents of their right to opt out. See 34 C.F.R. § 99.37.</li>
                  <li><strong>FTC & DoE Guidance</strong> – Additional guidance from the U.S. Federal Trade Commission and U.S. Department of Education on COPPA and FERPA compliance.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
