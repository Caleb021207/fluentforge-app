
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
  const [accessCode, setAccessCode] = useState("");

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
      // Update profile with role and languages
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role,
          native_language: nativeLanguage,
          target_language: targetLanguage,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (role === "teacher" && className.trim()) {
        // Create class
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .insert({ name: className.trim(), teacher_id: user.id })
          .select()
          .single();

        if (classError) throw classError;

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

          if (data?.created) {
            setCreatedAccounts(data.created);
            toast({
              title: "Students created!",
              description: `${data.created.length} student accounts were created successfully.`,
            });
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

  const handleStudentFinish = async () => {
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "student",
          native_language: nativeLanguage,
          target_language: targetLanguage,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Process access code if provided
      if (accessCode.trim()) {
        const { data, error } = await supabase.rpc("process_access_code", {
          p_code: accessCode.trim(),
        });

        if (error) throw error;
        const result = data as unknown as { success: boolean; message: string };
        if (!result.success) {
          toast({
            title: "Invalid Code",
            description: result.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
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
            <Button onClick={handleFinish} disabled={isLoading} className="gap-2">
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
    </div>
  );
};

export default OnboardingWizard;
