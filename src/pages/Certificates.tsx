
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import SpeakingListeningCertification from "@/components/certifications/SpeakingListeningCertification";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ExampleDataButton from "@/components/profile/ExampleDataButton";

const Certificates = () => {
  const [activeTab, setActiveTab] = useState("reading");
  const [user, setUser] = useState<User | null>(null);
  const [isExampleProfile, setIsExampleProfile] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Check if this is the example profile
        if (user?.email === "example@gmail.com") {
          setIsExampleProfile(true);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    getCurrentUser();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-lingua-text">Language Certifications</h1>
          <p className="text-muted-foreground mt-1">
            Take certified tests to measure your language proficiency
          </p>
        </div>
        {isExampleProfile && (
          <ExampleDataButton size="default" className="self-start sm:self-auto" />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certification Tests</CardTitle>
          <CardDescription>
            Take these tests to evaluate your skills in each language area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reading" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="speaking-listening">Speaking & Listening</TabsTrigger>
            </TabsList>
            <TabsContent value="reading">
              <ReadingCertification />
            </TabsContent>
            <TabsContent value="writing">
              <WritingCertification />
            </TabsContent>
            <TabsContent value="speaking-listening">
              <SpeakingListeningCertification />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certificates;
