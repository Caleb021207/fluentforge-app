
import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import LanguageSelectField from "@/components/home/language/LanguageSelectField";
import { getAvailableTargetLanguages } from "@/utils/languageUtils";
import { GraduationCap, BookOpen, Plus, Trash2, Users, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

interface OnboardingWizardProps {
  user: User;
  onComplete: () => void;
}

interface StudentRow {
  name: string;
  email: string;
  password: string;
}

const NATIVE_LANGUAGES: Record<string, string> = {
  english: "🇺🇸 English",
  spanish: "🇪🇸 Español",
  portuguese: "🇧🇷 Português",
  korean: "🇰🇷 한국어",
  arabic: "🇸🇦 العربية",
  mandarin: "🇨🇳 中文",
  cantonese: "🇭🇰 廣東話",
  vietnamese: "🇻🇳 Tiếng Việt",
  french: "🇫🇷 Français",
  japanese: "🇯🇵 日本語",
  russian: "🇷🇺 Русский",
  ukrainian: "🇺🇦 Українська",
  hindi: "🇮🇳 हिन्दी",
  indonesian: "🇮🇩 Bahasa Indonesia",
  farsi: "🇮🇷 فارسی",
  urdu: "🇵🇰 اردو",
  pashto: "🇦🇫 پښتو",
  swahili: "🇰🇪 Kiswahili",
  bengali: "🇧🇩 বাংলা",
  somali: "🇸🇴 Soomaali",
  yoruba: "🇳🇬 Yorùbá",
  amharic: "🇪🇹 አማርኛ",
  malayalam: "🇮🇳 മലയാളം",
  polish: "🇵🇱 Polski",
  turkish: "🇹🇷 Türkçe",
  romanian: "🇷🇴 Română",
  haitian: "🇭🇹 Kreyòl Ayisyen",
  igbo: "🇳🇬 Igbo",
  tagalog: "🇵🇭 Tagalog",
  german: "🇩🇪 Deutsch",
  italian: "🇮🇹 Italiano",
  thai: "🇹🇭 ภาษาไทย",
  gujarati: "🇮🇳 ગુજરાતી",
  punjabi: "🇮🇳 ਪੰਜਾਬੀ",
  nepali: "🇳🇵 नेपाली",
};

const TARGET_LANGUAGES: Record<string, string> = {
  english: "🇺🇸 English",
  spanish: "🇪🇸 Spanish",
  portuguese: "🇧🇷 Portuguese",
  korean: "🇰🇷 Korean",
  arabic: "🇸🇦 Arabic",
  mandarin: "🇨🇳 Mandarin Chinese",
  vietnamese: "🇻🇳 Vietnamese",
  french: "🇫🇷 French",
  japanese: "🇯🇵 Japanese",
  russian: "🇷🇺 Russian",
  ukrainian: "🇺🇦 Ukrainian",
  hindi: "🇮🇳 Hindi",
  indonesian: "🇮🇩 Indonesian",
  farsi: "🇮🇷 Farsi/Dari",
  urdu: "🇵🇰 Urdu",
  pashto: "🇦🇫 Pashto",
  swahili: "🇰🇪 Swahili",
  bengali: "🇧🇩 Bengali",
  somali: "🇸🇴 Somali",
  yoruba: "🇳🇬 Yoruba",
  amharic: "🇪🇹 Amharic",
  malayalam: "🇮🇳 Malayalam",
  polish: "🇵🇱 Polish",
  turkish: "🇹🇷 Turkish",
  romanian: "🇷🇴 Romanian",
  haitian: "🇭🇹 Haitian Creole",
  igbo: "🇳🇬 Igbo",
  tagalog: "🇵🇭 Filipino/Tagalog",
  german: "🇩🇪 German",
  italian: "🇮🇹 Italian",
  thai: "🇹🇭 Thai",
  gujarati: "🇮🇳 Gujarati",
  punjabi: "🇮🇳 Punjabi",
  nepali: "🇳🇵 Nepali",
};

const OnboardingWizard = ({ user, onComplete }: OnboardingWizardProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "teacher" | "">("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([
    { name: "", email: "", password: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<StudentRow[]>([]);
  const [createdClassCode, setCreatedClassCode] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [educatorCode, setEducatorCode] = useState("");

  const availableTargetLanguages = getAvailableTargetLanguages(nativeLanguage);
  const targetOptions = Object.fromEntries(
    availableTargetLanguages.map((lang) => [lang, TARGET_LANGUAGES[lang] || lang])
  );

  const addStudentRow = () => {
    setStudents([...students, { name: "", email: "", password: "" }]);
  };

  const removeStudentRow = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const updateStudent = (index: number, field: keyof StudentRow, value: string) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Teacher status is provisioned server-side: profiles.role is frozen
      // for client writes (plan 15 §1.2 role re-freeze, backlog R1), so the
      // wizard redeems an admin-issued educator access code via the
      // provision_teacher RPC instead of writing role directly.
      const { data: provisionData, error: provisionError } = await supabase.rpc(
        "provision_teacher" as never,
        { p_code: educatorCode.trim() } as never
      );
      if (provisionError) throw provisionError;
      const provisionResult = provisionData as unknown as {
        success: boolean;
        message: string;
      } | null;
      if (!provisionResult?.success) {
        toast({
          title: "Educator access code",
          description:
            provisionResult?.message || "That access code was not accepted.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Languages only — role was set by provision_teacher above, and the
      // restored privileged-column trigger would discard a client role write
      // anyway.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          native_language: nativeLanguage,
          target_language: targetLanguage,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      let newClassCode: string | null = null;

      if (role === "teacher" && className.trim()) {
        // Create class with a shareable join code (same format as the
        // dashboard's class creation).
        const classCode = `CLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .insert({ name: className.trim(), teacher_id: user.id, class_code: classCode })
          .select()
          .single();

        if (classError) throw classError;
        newClassCode = classData?.class_code ?? classCode;
        setCreatedClassCode(newClassCode);

        // Bulk create students if any valid rows
        const validStudents = students.filter(
          (s) => s.email.trim() && s.password.trim()
        );

        if (validStudents.length > 0 && classData) {
          const { data, error } = await supabase.functions.invoke(
            "bulk-create-students",
            {
              body: {
                students: validStudents,
                class_id: classData.id,
                native_language: nativeLanguage,
                target_language: targetLanguage,
              },
            }
          );

          if (error) throw error;

          if (data?.created?.length) {
            setCreatedAccounts(data.created);
            toast({
              title: "Students created!",
              description: `${data.created.length} student accounts were created successfully.`,
            });
            // Show the credentials screen instead of closing the wizard —
            // this is the teacher's only chance to save the passwords.
            setStep(4);
            return;
          }
        }
      }

      toast({
        title: "Profile set up!",
        description: "Your account is ready to go.",
      });
      onComplete();
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCredentials = () => {
    const rows = [
      ["Name", "Email", "Password"],
      ...createdAccounts.map((s) => [s.name, s.email, s.password]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className.trim() || "class"}-student-accounts.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStudentFinish = async () => {
    setIsLoading(true);
    try {
      // Update profile. role stays in the payload but is now a frozen column:
      // the restored protect_profile_privileged_columns trigger overwrites
      // NEW.role with OLD.role for non-admin writes (a silent no-op, not an
      // error), and 'student' is the signup default anyway (plan 15 §1.2).
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "student",
          native_language: nativeLanguage,
          target_language: targetLanguage,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Process the class/access code if provided: class join codes
      // (CLS-XXXXXX) first, legacy access codes as fallback.
      if (accessCode.trim()) {
        const code = accessCode.trim().toUpperCase();
        let joined = false;

        const { data: joinData } = await supabase.rpc("join_class_by_code" as never, {
          p_code: code,
        } as never);
        const joinResult = joinData as unknown as { success: boolean; message: string } | null;
        if (joinResult?.success) joined = true;

        if (!joined) {
          const { data, error } = await supabase.rpc("process_access_code", {
            p_code: code,
          });
          if (error) throw error;
          const result = data as unknown as { success: boolean; message: string };
          if (!result.success) {
            toast({
              title: "Invalid Code",
              description: joinResult?.message || result.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
      }

      toast({
        title: "Profile set up!",
        description: "Your account is ready to go.",
      });
      onComplete();
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicators
  const steps = ["Role", "Languages", role === "teacher" ? "Class Setup" : "Join Class"];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > i + 1
                    ? "bg-primary text-primary-foreground"
                    : step === i + 1
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 ${step > i + 1 ? "bg-primary" : "bg-muted"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">{t("welcome")}!</h1>
            <p className="text-muted-foreground mt-2">What best describes you?</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                role === "student" ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={() => setRole("student")}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-xl font-semibold">I'm a Student</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  I want to practice and learn a new language
                </p>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                role === "teacher" ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={() => setRole("teacher")}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <GraduationCap className="h-16 w-16 mb-4 text-primary" />
                <h3 className="text-xl font-semibold">I'm a Teacher</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  I want to manage classes and student rosters
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!role} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Language Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Set Your Languages</h2>
            <p className="text-muted-foreground mt-2">
              Choose your native language and the language you want to {role === "teacher" ? "teach" : "learn"}
            </p>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <LanguageSelectField
                id="native-language"
                value={nativeLanguage}
                onChange={(val) => {
                  setNativeLanguage(val);
                  setTargetLanguage("");
                }}
                label="My native language"
                placeholder="Select your native language"
                options={NATIVE_LANGUAGES}
              />
              <LanguageSelectField
                id="target-language"
                value={targetLanguage}
                onChange={setTargetLanguage}
                label={role === "teacher" ? "Language I teach" : "Language I want to learn"}
                placeholder="Select target language"
                options={targetOptions}
                disabled={!nativeLanguage}
              />
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!nativeLanguage || !targetLanguage}
              className="gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3a: Teacher - Class Setup + Roster */}
      {step === 3 && role === "teacher" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Create Your Class</h2>
            <p className="text-muted-foreground mt-2">
              Set up a class and add your students. You can also do this later.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Educator Access Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="educator-code" className="sr-only">
                Educator access code
              </Label>
              <Input
                id="educator-code"
                placeholder="Enter the code from your school"
                value={educatorCode}
                onChange={(e) => setEducatorCode(e.target.value)}
                className="text-center text-lg tracking-widest uppercase"
              />
              <p className="text-sm text-muted-foreground">
                Teacher accounts require an access code issued by your school or
                district. Don&apos;t have one? Ask your administrator.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Spanish Period 1"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </CardContent>
          </Card>

          {className.trim() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Student Roster (optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add student emails and temporary passwords. Students can change their password after first login.
                </p>
                {students.map((student, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input
                      placeholder="Name"
                      value={student.name}
                      onChange={(e) => updateStudent(i, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={student.email}
                      onChange={(e) => updateStudent(i, "email", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Password"
                      value={student.password}
                      onChange={(e) => updateStudent(i, "password", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStudentRow(i)}
                      disabled={students.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addStudentRow} className="gap-2 w-full">
                  <Plus className="h-4 w-4" /> Add Another Student
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isLoading || !educatorCode.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {className.trim() ? "Create Class & Finish" : "Skip & Finish"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3b: Student - Access Code */}
      {step === 3 && role === "student" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Join a Class</h2>
            <p className="text-muted-foreground mt-2">
              Enter a class code from your teacher, or skip to explore on your own.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Label>Class Access Code (optional)</Label>
              <Input
                placeholder="Enter code from your teacher"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-lg tracking-widest uppercase"
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleStudentFinish} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {accessCode.trim() ? "Join Class & Finish" : "Skip & Finish"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Teacher - created student credentials (one-time view) */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Save Your Students' Login Details</h2>
            <p className="text-muted-foreground mt-2">
              This is the only time these passwords are shown. Download the list
              before you finish.
            </p>
          </div>

          {createdClassCode && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Class join code</p>
                <p className="text-2xl font-bold tracking-widest">{createdClassCode}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Students with their own accounts can also join with this code.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 font-medium">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdAccounts.map((s, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-4">{s.name}</td>
                        <td className="py-2 pr-4">{s.email}</td>
                        <td className="py-2 font-mono">{s.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={downloadCredentials} className="gap-2">
              Download CSV
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Profile set up!",
                  description: "Your class is ready to go.",
                });
                onComplete();
              }}
              className="gap-2"
            >
              <Check className="h-4 w-4" /> Done — I saved the list
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard;
