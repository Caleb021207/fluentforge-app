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
                </div>

                <Separator className="my-8" />

                {/* EULA Section */}
                <h2 className="text-2xl font-bold mb-4">1. End-User License Agreement (EULA)</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: November 2, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Definitions</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>"Software"</strong> – The Palavox language-learning and testing platform, including all websites, mobile applications, underlying code, documentation, and services.</li>
                  <li><strong>"User" / "You"</strong> – Any individual or entity who downloads, accesses, or uses the Software (students, parents/guardians, teachers, school administrators, etc.).</li>
                  <li><strong>"Licensee"</strong> – The party accepting this EULA. By installing or using the Software, you agree to these terms.</li>
                  <li><strong>"Company"</strong> – Palavox, operated by Palavox, LLC, a limited-liability company, and its authorized affiliates.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Grant of License</h3>
                <p className="mb-3"><strong>Non-exclusive license</strong> – Subject to this EULA, we grant you a limited, non-transferable, non-exclusive, revocable license to access and use the Software solely for educational purposes.</p>
                <p className="mb-3"><strong>Permitted uses</strong> – You may use the Software for language instruction, assessment, and certification in an educational context via a web browser or approved app.</p>
                <p className="mb-3"><strong>Prohibited uses</strong> – You must not:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Copy, modify, distribute, or sell any part of the Software without our prior written consent.</li>
                  <li>Reverse-engineer, decompile, or attempt to discover source code or algorithms.</li>
                  <li>Circumvent security or technical measures.</li>
                  <li>Use the Software for non-educational, illegal, harmful, or abusive purposes (e.g., publicly posting test items or aiding cheating).</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Intellectual Property Rights</h3>
                <p className="mb-3">All Software components (source code, architecture, content, trademarks, logos) are owned by Palavox or our licensors. Your use does not grant you ownership.</p>
                <p className="mb-3"><strong>User content</strong> – You retain ownership of any responses, recordings, or materials you create. You grant Palavox a limited, non-exclusive license to process and display such content solely to provide educational services.</p>
                <p className="mb-3"><strong>Feedback</strong> – Any feedback you submit may be used by Palavox, royalty-free, to improve our services.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Term and Termination</h3>
                <p className="mb-4">This license is effective until terminated. You may terminate by deleting your account and ceasing all use. We may suspend or terminate your license if you breach this EULA or our Terms of Service. Sections on intellectual property, liability, and governing law survive termination.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Disclaimers</h3>
                <p className="mb-3"><strong>No warranty</strong> – The Software is provided "as is" and "as available" without any warranties (express or implied). We do not guarantee uninterrupted operation or error-free content.</p>
                <p className="mb-3"><strong>No guaranteed outcomes</strong> – Scores are assessments only and do not guarantee educational placement, employment, or admission.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Limitation of Liability</h3>
                <p className="mb-4">To the extent permitted by law, Palavox is not liable for indirect, incidental, or consequential damages. Our total liability will not exceed the greater of US $100 or the amount you paid to use the Software during the prior twelve months.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Governing Law & Dispute Resolution</h3>
                <p className="mb-4">This EULA is governed by Alabama law, without regard to conflict-of-law principles. Disputes are subject to informal negotiation; if unresolved, mediation or binding arbitration will occur in Pike County, Alabama. The prevailing party may recover reasonable attorney's fees.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Entire Agreement</h3>
                <p className="mb-4">This EULA, together with our Terms of Service and Privacy Policy, constitutes the entire agreement between you and Palavox.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Contact</h3>
                <p className="mb-4">All inquiries should be directed to <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>.</p>

                <Separator className="my-8" />

                {/* Terms of Service Section */}
                <h2 className="text-2xl font-bold mb-4">2. Terms of Service (ToS)</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: November 2, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Acceptance</h3>
                <p className="mb-4">By using Palavox, you agree to these Terms. If you disagree, do not use the platform.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Accounts & Eligibility</h3>
                <p className="mb-3"><strong>Minimum age</strong> – You must be at least 8 years old. If under 13, a parent or guardian must provide verifiable consent and supervise use (COPPA).</p>
                <p className="mb-3"><strong>Registration</strong> – Provide a valid email and password. Keep your information current.</p>
                <p className="mb-3"><strong>Security</strong> – You are responsible for safeguarding your login. Notify us immediately of any unauthorized use.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. User Responsibilities</h3>
                <p className="mb-3"><strong>Educational use only</strong> – Use Palavox for legitimate language learning, testing, or teaching purposes.</p>
                <p className="mb-3"><strong>Content standards</strong> – Do not upload content that is unlawful, obscene, defamatory, harassing, hateful, or violates copyright or privacy. We employ safety filters to comply with CIPA and other laws.</p>
                <p className="mb-3"><strong>Prohibited conduct</strong> – Cheating, sharing answers, using bots, or misrepresenting identity is prohibited. Attempting to circumvent security measures is also prohibited.</p>
                <p className="mb-3"><strong>Teacher & admin obligations</strong> – Teachers and administrators must ensure use aligns with FERPA, COPPA, and CIPA, obtain necessary parental consent, and supervise students.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Platform Features</h3>
                <p className="mb-3"><strong>Testing & Assessment</strong> – Palavox includes a comprehensive testing suite built around CEFR, ACTFL, and STAMP frameworks. Students can complete adaptive multi-phase assessments covering reading, listening, writing, pronunciation, and conversational fluency, all evaluated by AI with detailed performance reports. Tests automatically adjust difficulty based on learner responses, ensuring accurate proficiency mapping and measurable growth over time.</p>
                
                <p className="mb-3"><strong>Conversational Practice</strong> – Students can engage in AI-powered text and voice conversations that adapt to their proficiency level (A1–C1).</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Text Practice</strong> enables grammar-corrected bilingual conversations with live translation and XP rewards, subject to each plan's monthly token limits.</li>
                  <li><strong>Voice Chat</strong> enables students to speak freely using Whisper STT for transcription and Azure TTS for realistic audio feedback.</li>
                  <li><strong>Premium Voice Chat (GPT-4o Realtime)</strong> offers natural, low-latency voice interaction for immersive speaking practice.</li>
                  <li><strong>Pronunciation Practice</strong> provides word-by-word accuracy scoring and targeted phrase repetition.</li>
                </ul>

                <p className="mb-3"><strong>Learning Modules</strong> – Includes interactive lessons, vocabulary flashcards, guided conversation prompts, and grammar reinforcement activities. Each module rewards users with XP and streak progress to encourage consistent learning habits. Progress automatically syncs across sessions and devices.</p>

                <p className="mb-3"><strong>Progress Tracking & Analytics</strong> – Every learner has access to a personal analytics dashboard that displays CEFR-aligned progress metrics, skill growth charts, and XP milestones. Teachers and administrators can view aggregated data across students, classes, and schools to monitor engagement and improvement in real time.</p>

                <p className="mb-3"><strong>Gamification System</strong> – A robust gamified learning layer motivates users through:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>XP points for every completed activity</li>
                  <li>Daily streaks and milestone achievements</li>
                  <li>Level-up animations and celebratory modals</li>
                  <li>Leaderboards for friendly classroom competition</li>
                </ul>

                <p className="mb-3"><strong>Voice & Translation Infrastructure</strong> – All AI voices and transcriptions are powered by:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Azure Neural TTS (Text-to-Speech):</strong> lifelike multilingual voices across all supported languages</li>
                  <li><strong>OpenAI Whisper (Speech-to-Text):</strong> native pronunciation support and high-accuracy multilingual transcription</li>
                  <li><strong>OpenAI GPT-4o / GPT-4o-mini:</strong> advanced conversational models for adaptive feedback</li>
                </ul>

                <p className="mb-4">The system automatically switches to browser-based fallback modes when token or time limits are reached. Fallback maintains functionality at reduced priority and may have lower quality, higher latency, or feature differences until monthly limits reset.</p>

                <p className="mb-3"><strong>Security & Compliance</strong> – Built with education-first privacy in mind:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>FERPA / COPPA / CIPA-compliant data handling</li>
                  <li>Encrypted storage for all sensitive student data</li>
                  <li>Parental consent logging and audit trails</li>
                  <li>Role-based access controls for teachers, admins, and districts</li>
                  <li>Rate limiting and RLS policies to prevent data abuse</li>
                  <li>Palavox aims to conform to WCAG 2.1 AA and will remediate accessibility issues reported by districts.</li>
                </ul>

                <p className="mb-3"><strong>Usage Limits (Monthly Reset)</strong></p>
                <p className="mb-2"><strong>Standard Tier:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>22.5K TTS tokens (~150 minutes)</li>
                  <li>150K Text Practice tokens</li>
                  <li>120 minutes Whisper STT</li>
                  <li>Premium Voice: Disabled</li>
                </ul>

                <p className="mb-2"><strong>Premium Tier:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>33.75K TTS tokens (~225 minutes)</li>
                  <li>300K Text Practice tokens</li>
                  <li>180 minutes Whisper STT</li>
                  <li>15 minutes Premium Voice (Realtime)</li>
                </ul>

                <p className="mb-4">All limits reset monthly and include real-time tracking with usage alerts at 90% capacity. When limits are reached, Palavox automatically falls back to free in-browser speech options to maintain an uninterrupted learning experience.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Payments, Pricing & Licensing</h3>
                <p className="mb-4">Palavox operates on an annual academic-year license (9 months of student access, invoiced for 12 months to cover ongoing support and infrastructure). Student access runs August–May; year-round admin access, support, maintenance, and compliance operations are included in the annual price—therefore invoicing is annual (12 months). Districts may mix Standard and Premium student seats as needed.</p>

                <p className="mb-3"><strong>Overages and add-ons</strong> – If an organization anticipates higher usage, Palavox may offer additional token/minute bundles or plan upgrades by written agreement. Fallback processing remains available as described in the Platform Features section but may operate at reduced priority or quality.</p>

                <p className="mb-3"><strong>Standard Plan:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>$70 per student per academic year</li>
                  <li>Includes text and voice practice (GPT-4o-mini + Azure TTS)</li>
                  <li>22.5K TTS tokens (~150 minutes/month)</li>
                  <li>150K Text Practice tokens/month</li>
                  <li>120 minutes Whisper STT/month</li>
                  <li>Access to all practice and progress-tracking features</li>
                </ul>

                <p className="mb-3"><strong>Premium Plan:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>$100 per student per academic year</li>
                  <li>Adds GPT-4o Realtime "Advanced Voice" conversation (15 minutes/month)</li>
                  <li>33.75K TTS tokens (~225 minutes/month)</li>
                  <li>300K Text Practice tokens/month</li>
                  <li>180 minutes Whisper STT/month</li>
                  <li>Priority support and additional analytics tools</li>
                </ul>

                <p className="mb-4"><strong>Assessment add-ons</strong> – Certification tests (Reading, Writing, or Speaking) may be purchased separately at the then-current published price or by written agreement for districtwide bundles.</p>

                <p className="mb-3"><strong>Billing Terms:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Invoiced annually at the start of each school year</li>
                  <li>Payment due within 30 days of invoice date</li>
                  <li>Renewal each July for following school year</li>
                  <li>Multi-year and district-wide pricing available upon request</li>
                  <li>Late payments accrue 1.5%/month (where permitted) or the maximum allowed by law.</li>
                  <li>Refunds are limited to service unavailability exceeding the SLA; otherwise fees are non-refundable once access codes are issued.</li>
                </ul>

                <p className="mb-4"><strong>Pilot Programs</strong> – Pilot implementations are available at a reduced cost for initial evaluation periods (typically one quarter or semester). Pilots include all Premium Plan features, administrative onboarding, and full technical support.</p>

                <p className="mb-4">Refunds or credits are issued only according to Palavox's published refund policy.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Suspension & Termination</h3>
                <p className="mb-4">Palavox may suspend or terminate accounts for violations of these Terms or for fraud or abuse. Termination does not waive prior obligations.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Disclaimers & Limitation of Liability</h3>
                <p className="mb-4">The Software is provided "as is" without warranties. We do not guarantee outcomes. Our liability is limited as described in the EULA.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Indemnification</h3>
                <p className="mb-4"><strong>Indemnification</strong> – You agree to indemnify and hold harmless Palavox from third-party claims arising from your violation of these Terms or applicable law. Palavox will indemnify and hold you harmless from third-party claims alleging (a) that the Palavox platform, as provided by Palavox, infringes a U.S. intellectual-property right, or (b) a data breach caused by Palavox's failure to implement the security measures described in the Privacy Policy or required by applicable law. Each party's indemnity is conditioned on prompt written notice, reasonable cooperation, and sole control of the defense and settlement by the indemnifying party.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Modifications</h3>
                <p className="mb-4">We may update these Terms. Material changes will be posted and emailed at least 30 days before taking effect. Continued use constitutes acceptance.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. Dispute Resolution</h3>
                <p className="mb-4">Before filing a claim, the parties will attempt in good faith to resolve the dispute through informal discussions for 30 days. If unresolved, the dispute shall be submitted to mediation, and if still unresolved, to binding arbitration in Pike County, Alabama. Either party may seek injunctive relief in a court of competent jurisdiction to prevent misuse of confidential information or intellectual property.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11. Governing Law & Contact</h3>
                <p className="mb-4">Governed by Alabama law. Questions: <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>.</p>

                <Separator className="my-8" />

                {/* Privacy Policy Section */}
                <h2 className="text-2xl font-bold mb-4">3. Privacy Policy</h2>
                <p className="text-sm text-muted-foreground mb-6">Effective Date: November 2, 2025</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Scope</h3>
                <p className="mb-4">This Privacy Policy applies to all users (students, parents, teachers, administrators, visitors) and explains what information we collect, how we use it, and your rights.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information</strong> – Email address and, optionally, a display name.</li>
                  <li><strong>Educational Data</strong> – Test responses, assignments, progress metrics, session durations, scores.</li>
                  <li><strong>Technical Data</strong> – IP address, browser type, device identifiers, and usage statistics (e.g., page views, lesson completions).</li>
                  <li><strong>Cookies & Local Storage</strong> – Used for session authentication, preferences, and aggregated analytics (no third-party ad cookies).</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. How We Use Data</h3>
                <p className="mb-3"><strong>Platform delivery & improvement</strong> – To operate the platform, personalize learning experiences, provide scores and feedback, and improve our services. AI models process responses to generate results; we do not use children's identifiable data for AI training without separate consent (see below). For adult users, Palavox does not use identifiable content to train models without separate, opt-in consent. We do not allow our vendors to use Palavox customer content to train their foundation models.</p>
                <p className="mb-3"><strong>Communication</strong> – To send account notices, test results, product updates, or policy changes.</p>
                <p className="mb-3"><strong>Aggregated analytics</strong> – We may analyze de-identified, aggregated data to improve content and measure performance.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Educational Records & FERPA</h3>
                <p className="mb-3">Palavox acts as a school official under FERPA. We process educational records under the school's direct control for authorized educational purposes. We use de-identified or aggregated data (removing direct and indirect identifiers) for improvement and analytics. We do not re-identify de-identified data.</p>
                <p className="mb-4">Schools control disclosure of personally identifiable information (PII) and must obtain parental consent where required.</p>
                <p className="mb-4"><strong>De-identification methodology</strong> – When we use de-identified data for improvement or analytics, we remove direct identifiers (names, emails, IP addresses, device IDs) and mask or generalize quasi-identifiers (timestamps, locations, school identifiers) using aggregation, hashing, tokenization, and date/geo bucketing. We also apply minimum group sizes for reports and suppress small-n results to reduce re-identification risk. We do not attempt to re-identify de-identified data, and our subprocessors strictly prohibit doing so as well.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Children's Privacy (COPPA)</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>We do not collect personal information from children under 13 without verifiable parental consent.</li>
                  <li><strong>AI Training Consent (Minors)</strong> – We do not use a child's identifiable personal information to train or improve AI models beyond generating scores and feedback without separate, opt-in parental consent that clearly explains the purpose and scope. If consent is not given, we will not use identifiable information for training; only de-identified data may be used. Parents may revoke consent at any time, and revocation will apply to future processing.</li>
                  <li><strong>Data minimization</strong> – We minimize the data we collect to what is necessary for educational purposes and process audio in real time for minors without storing any recordings.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. CIPA Support</h3>
                <p className="mb-4">Palavox supports compliance with the Children's Internet Protection Act by providing content-filtering tools and safety controls, but schools retain responsibility for internet safety policies and filtering of obscene or harmful content.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Data Sharing</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>With schools</strong> – We share test results and progress metrics with the respective schools and teachers under the school's direct control.</li>
                  <li><strong>With parents/guardians</strong> – Parents can access their child's data via school-managed portals when authorized.</li>
                  <li><strong>With service providers</strong> – We use a limited number of vetted subprocessors only to deliver Palavox services. Subprocessors must process data solely for Palavox's purposes, maintain confidentiality, and delete or de-identify data promptly after service delivery. Current subprocessors are OpenAI (GPT-4o/mini & Whisper), Microsoft Azure (Neural TTS), and Supabase (auth/database).</li>
                  <li><strong>Subprocessor retention and training</strong> – OpenAI retains API input/output logs for up to 30 days solely for abuse monitoring and then deletes them; OpenAI does not use our content to train its models. Microsoft Azure processes audio/text to deliver requested outputs and does not retain customer content after response generation. Supabase hosts authentication/database under Palavox's control and follows Palavox's deletion schedule. While we require prompt deletion by contract wherever feasible, we cannot compel vendors beyond their published policies.</li>
                  <li>We maintain an up-to-date subprocessor list at [upon request]. We will provide 30 days' notice before adding or replacing a subprocessor, except for urgent risk or continuity reasons.</li>
                  <li><strong>For legal requirements</strong> – We may disclose data if required by law or to protect rights or safety.</li>
                  <li><strong>No sale of personal data</strong> – We do not sell or rent user data.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Data Retention and Deletion</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information</strong> – Retained until you delete your account, plus 90 days for support and secure backup erasure.</li>
                  <li><strong>Test Responses and Educational Records</strong> – Retained for up to 3 years, or shorter if a school contract requires less, to support accreditation, re-evaluation, and audits. Deleted or de-identified after that period.</li>
                  <li><strong>Usage Metrics</strong> – Retained for 2 years for analytics and improvement, then aggregated or deleted.</li>
                  <li><strong>Audio Recordings</strong> – Minors' audio is processed in real time and not stored. Adults may opt-in to storage for portfolio features (off by default).</li>
                  <li><strong>Certification Data</strong> – Retained for up to 5 years to enable verification of credentials, then deleted unless required by law or school policy.</li>
                  <li><strong>Annual review</strong> – We conduct an annual retention review and shorten schedules where feasible. All deletions use NIST 800-88-aligned secure erasure.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Security Measures</h3>
                <p className="mb-3">We maintain a Written Information Security Program (WISP) that includes:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Encryption (AES-256 at rest, TLS 1.3 in transit).</li>
                  <li>Role-based access control (RLS), least privilege, and logging of access to educational records.</li>
                  <li><strong>Testing and risk management</strong> – Annual risk assessments, periodic penetration tests, vulnerability scanning, and documented remediation.</li>
                  <li><strong>Workforce safeguards</strong> – Employee background checks where permitted, confidentiality agreements, and annual privacy/security training.</li>
                  <li><strong>Breach notification</strong> – If a data breach involving personal information occurs, we will notify affected schools and users within 72 hours of confirming the incident, with details of the incident, data affected, and steps taken. We will coordinate with schools to meet any additional state or federal notice requirements.</li>
                  <li>Fallback speech features rely on browser-based or cloud processing and are subject to the same access-control principles; access to education records is logged and periodically reviewed.</li>
                  <li><strong>Vendor management / Subprocessor limits</strong> – We perform security and privacy due diligence on all subprocessors and review their policies annually. While we cannot compel third-party vendors beyond their published retention and deletion practices, our goal is to formalize written agreements wherever feasible requiring data minimization, confidentiality, and prompt deletion after service delivery. Current subprocessors retain data for 30 days or less, and Microsoft Azure does not retain content.</li>
                  <li><strong>Data Location</strong> – All data is stored in US-based regions with US-based backups.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. International Users (GDPR and Other Laws)</h3>
                <p className="mb-3">For users in the EEA and other jurisdictions, we rely on Standard Contractual Clauses and other lawful bases to transfer data to the U.S. We honor rights to access, rectify, erase, or port personal data. You can exercise these rights via <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>.</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Transfers</strong> – For EEA/UK users, we rely on Standard Contractual Clauses and other lawful bases to transfer data to the U.S.</li>
                  <li><strong>Rights</strong> – You may request access, rectification, erasure, restriction, objection, or portability by emailing <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>. We respond within 30 days, or explain any lawful extension.</li>
                  <li><strong>DPO contact</strong> – Our data protection contact (DPO function) is reachable at <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a> for GDPR inquiries.</li>
                  <li><strong>Complaint</strong> – EEA/UK users may also lodge a complaint with their data protection authority.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">11. Your Rights</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Access & correction</strong> – You may request to view or correct your personal information.</li>
                  <li><strong>Opt-out of analytics</strong> – You may request that your data not be used for analytics, subject to legal or contractual obligations.</li>
                  <li><strong>Deletion</strong> – You may request deletion of personal information where permitted by law. Some data may need to be retained for educational or legal compliance.</li>
                  <li><strong>Directory information opt-out</strong> – Parents can opt out of disclosure of directory information by notifying the school.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">12. Changes to This Policy</h3>
                <p className="mb-4">Material changes will be emailed and posted at least 30 days before they take effect. Continued use after the effective date constitutes acceptance.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">13. Contact</h3>
                <p className="mb-4">Questions about this Privacy Policy or data rights should be sent to <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a> (DPO contact).</p>

                <Separator className="my-8" />

                {/* School Service Agreement Section */}
                <h2 className="text-2xl font-bold mb-4">4. School Service Agreement</h2>
                <p className="text-sm text-muted-foreground mb-6">Last Updated: November 2, 2025</p>
                <p className="mb-4">This Agreement governs use of Palavox by schools and educational institutions.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Scope of Services</h3>
                <p className="mb-4">Palavox provides an AI-powered platform for language learning and certification, including test administration, scoring, analytics, gamified lessons, text and voice practice, pronunciation practice, premium real-time AI voice (Premium plan), progress tracking, class management tools, and support for multi-language user interfaces.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. FERPA & Data Processing</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Data processor role</strong> – Palavox acts as the School's data processor and a "school official" with a legitimate educational interest. We use student data only to deliver educational services and improve them with de-identified data.</li>
                  <li><strong>Security</strong> – We implement encryption, role-based access control, audit logs, annual risk assessments, and a WISP as outlined in the Privacy Policy. Schools may audit our compliance. Upon reasonable prior notice, Palavox will provide security and privacy documentation (e.g., WISP summary, third-party audit summaries, penetration-test attestation) to support the School's compliance reviews.</li>
                  <li><strong>Access, Amendment & Disclosure</strong> – We assist schools in responding to record requests, ensuring access within 45 days and recording amendments or statements of disagreement. Palavox will assist the School in fulfilling parent/eligible student requests within FERPA timelines and will apply School-directed corrections or append statements of disagreement as instructed.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. School Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Parental consent</strong> – Schools must obtain verifiable parental consent under COPPA and FERPA for students under 13.</li>
                  <li><strong>Internet safety</strong> – If receiving E-Rate funding, schools must implement content filtering as required by CIPA; Palavox provides tools but does not replace these obligations.</li>
                  <li><strong>Account supervision</strong> – Schools manage teacher and student accounts and monitor usage.</li>
                  <li><strong>Certification codes</strong> – Schools issue and track test codes; misuse must be addressed promptly.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Confidentiality & Disclosure</h3>
                <p className="mb-4">Both parties agree to maintain confidentiality of education records. Palavox does not disclose directory information unless instructed by the school, and only after parents have an opportunity to opt out. Subprocessors are bound by contracts to adhere to equivalent data protections and delete data after service delivery.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Term & Termination</h3>
                <p className="mb-4">This Agreement remains in effect for one year or until terminated by either party. This agreement automatically renews annually unless the district gives 45 days written notice. Either party may terminate for material breach. On termination, Palavox will assist with data transfer or deletion per FERPA.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6. Indemnity & Liability</h3>
                <p className="mb-4">Each party indemnifies the other for third-party claims arising from its breach or legal violations. Neither party is liable for indirect or consequential damages.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7. Notices</h3>
                <p className="mb-4">Notices must be in writing to the designated contacts of each party.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">8. Export Controls</h3>
                <p className="mb-4">User represents they are not on U.S. restricted lists; no export to embargoed countries.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">9. Service Levels</h3>
                <p className="mb-4">Palavox targets 99.5% monthly uptime excluding scheduled maintenance (≤4 hrs/mo with 48-hr notice). P1 incidents (platform down) receive initial response within 4 business hours; other tickets within 1 business day.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">10. Assignment</h3>
                <p className="mb-4">Palavox may assign this Agreement in connection with a merger, acquisition, or sale of assets.</p>

                <Separator className="my-8" />

                {/* FERPA Compliance Statement */}
                <h2 className="text-2xl font-bold mb-4">5. FERPA Compliance Statement</h2>
                <p className="mb-4">Palavox is committed to protecting the privacy of student education records in accordance with FERPA and state laws.</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Access rights</strong> – We work with schools to enable parents to review their child's education records within 45 days of a request via secure portals.</li>
                  <li><strong>Amendment rights</strong> – We support schools in correcting inaccurate or misleading records. If a record is not corrected, parents may include a statement of disagreement.</li>
                  <li><strong>Consent for disclosure</strong> – Palavox does not share PII from education records without written parental consent, except to school officials with legitimate educational interests or in compliance with FERPA exceptions.</li>
                  <li><strong>Directory information</strong> – We do not designate directory information; schools determine and notify parents of directory information and opt-out rights.</li>
                  <li><strong>Security</strong> – Our database uses AES-256 encryption, TLS 1.3, role-based access controls, audit logs, and de-identification for improvement.</li>
                  <li><strong>Record of disclosures</strong> – We maintain logs of disclosures so parents or eligible students can review them.</li>
                  <li><strong>Training & awareness</strong> – Employees handling education records receive annual training on FERPA and privacy best practices and sign confidentiality agreements.</li>
                </ul>
                <p className="mb-4">For FERPA questions, contact <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>.</p>

                <Separator className="my-8" />

                {/* COPPA Notice */}
                <h2 className="text-2xl font-bold mb-4">6. COPPA Notice</h2>
                <p className="mb-4">Palavox complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13 without verifiable parental consent.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect from Children</h3>
                <p className="mb-4">With parental consent, we collect email (for login), language preferences, test responses, and usage statistics. We do not collect names, addresses, or unnecessary identifiers.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. How We Use Children's Information</h3>
                <p className="mb-4">Solely to provide language learning, generate scores, and deliver feedback. We do not disclose personal information to third parties except subprocessors that support platform operation (e.g., OpenAI, Azure).</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Parental Rights</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Parents may review and delete their child's personal information at any time and refuse further collection.</li>
                  <li>Separate consent is required for non-integral uses like AI training. If not provided, such uses do not occur.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. How to Provide Consent</h3>
                <p className="mb-4">Schools or parents may provide consent via email plus verification, signed paper form, or video call. If consent is not obtained within a reasonable period after notice, we delete the child's information.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Contact</h3>
                <p className="mb-4">For COPPA questions or to exercise rights, email <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a>.</p>

                <Separator className="my-8" />

                {/* Cookie Policy */}
                <h2 className="text-2xl font-bold mb-4">7. Cookie Policy</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. What Are Cookies?</h3>
                <p className="mb-4">Small text files stored on your device. We use them to operate and improve Palavox.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. How We Use Cookies</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Essential cookies</strong> – Authenticate users and maintain sessions.</li>
                  <li><strong>Analytics cookies</strong> – Collect anonymized usage statistics to improve our services.</li>
                  <li><strong>Functionality cookies</strong> – Remember preferences such as language and interface settings.</li>
                  <li><strong>No advertising cookies</strong> – We do not use cookies for third-party marketing or targeted advertising.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Managing Cookies</h3>
                <p className="mb-4">You can adjust browser settings to decline cookies. Disabling essential cookies may limit platform functionality. By using Palavox, you consent to our use of cookies as described.</p>

                <Separator className="my-8" />

                {/* Acceptable Use Policy */}
                <h2 className="text-2xl font-bold mb-4">8. Acceptable Use Policy (AUP)</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Purpose</h3>
                <p className="mb-4">To ensure a safe, ethical, and productive environment.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Permitted Uses</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Educational activities (language learning, testing, practice).</li>
                  <li>Approved educational research with anonymized data.</li>
                  <li>Parent engagement with proper authorization.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Prohibited Conduct</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Unlawful activities</strong> – Violating any applicable law, including copyright or privacy laws.</li>
                  <li><strong>Content violations</strong> – Uploading or sharing obscene, violent, hateful, harassing, or pornographic content. Schools receiving E-Rate funding must block obscene or harmful content; Palavox provides filters but does not replace school filtering responsibilities.</li>
                  <li><strong>Cheating & misconduct</strong> – Sharing answers, using bots, or collaborating on individual assessments.</li>
                  <li><strong>Security violations</strong> – Circumventing security measures, introducing malware, or accessing accounts without authorization.</li>
                  <li><strong>Data misuse</strong> – Collecting or redisclosing personal information or test content without authorization.</li>
                  <li><strong>Misrepresentation</strong> – Impersonating others or misrepresenting affiliation.</li>
                  <li><strong>Commercial use</strong> – Selling or licensing platform content without authorization.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Enforcement</h3>
                <p className="mb-4">Violations may result in suspension or termination of your account, notification of the school, or reporting to legal authorities. Repeat violations can lead to permanent bans.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Reporting</h3>
                <p className="mb-4">Report concerns to <a href="mailto:info@palavox.org" className="text-primary hover:underline">info@palavox.org</a> or via the in-app report feature.</p>

                <Separator className="my-8" />

                {/* Legal Citations Appendix */}
                <h2 className="text-2xl font-bold mb-4">9. Legal Citations Appendix</h2>
                <p className="mb-3">This appendix references the primary laws and guidance informing our policies:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>COPPA</strong> – 15 U.S.C. §§ 6501–6506; 16 C.F.R. Part 312. See FTC's guidance for verifiable parental consent and limitations on non-integral data uses (2025 amendments).</li>
                  <li><strong>FERPA</strong> – 20 U.S.C. § 1232g; 34 C.F.R. Part 99. DoE guidance on third-party service providers and parental rights.</li>
                  <li><strong>CIPA</strong> – 47 U.S.C. § 254(h)(5). Schools receiving E-Rate funds must block access to obscene or harmful content.</li>
                  <li><strong>GDPR</strong> – Regulation (EU) 2016/679 for international users.</li>
                  <li><strong>Student Privacy Policy Office</strong> – DoE resources on data privacy best practices.</li>
                  <li><strong>FTC COPPA Final Rule (2025)</strong> – Separate consent for non-integral uses and updated security requirements.</li>
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