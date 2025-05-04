import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import ProgressChart from "@/components/progress/ProgressChart";
import ProgressPageHeader from "@/components/progress/ProgressPageHeader";
import RecentAttemptsCard from "@/components/progress/RecentAttemptsCard";
import UnauthenticatedProgress from "@/components/progress/UnauthenticatedProgress";
import RecommendationCard from "@/components/progress/RecommendationCard";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { useLocalization } from "@/hooks/useLocalization";

const Progress = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { t } = useLocalization();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user.id || null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user.id || null);
    });
  }, []);

  return (
    <div>
      {session ? (
        <>
          <ProgressPageHeader />
          <div className="container max-w-5xl mx-auto py-8 space-y-6">
            <Tabs defaultValue="overall" className="w-full">
              <TabsList>
                <TabTrigger value="overall">{t("overall")}</TabTrigger>
                <TabTrigger value="reading">{t("reading")}</TabTrigger>
                <TabTrigger value="writing">{t("writing")}</TabTrigger>
                <TabTrigger value="speaking">{t("speaking")}</TabTrigger>
                <TabTrigger value="listening">{t("listening")}</TabTrigger>
              </TabsList>
              <TabsContent value="overall">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("overallProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart userId={userId || ""} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reading">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("readingProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart userId={userId || ""} type="reading" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="writing">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("writingProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart userId={userId || ""} type="writing" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="speaking">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("speakingProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart userId={userId || ""} type="speaking" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="listening">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("listeningProgress")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart userId={userId || ""} type="listening" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecentAttemptsCard userId={userId || ""} />
              <RecommendationCard />
            </div>
          </div>
        </>
      ) : (
        <UnauthenticatedProgress />
      )}
    </div>
  );
};

export default Progress;

interface TabTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ className, value, children, ...props }, ref) => (
    <TabsTrigger ref={ref} className={className} value={value} {...props}>
      {children}
    </TabsTrigger>
  )
);
TabTrigger.displayName = "TabTrigger";

