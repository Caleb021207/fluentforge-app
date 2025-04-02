
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, GraduationCap } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { CEFRLevels } from "@/components/language-frameworks/CEFRLevels";
import { ACTFLLevels } from "@/components/language-frameworks/ACTFLLevels";
import { cefrLevels, actflLevels } from "@/data/languageFrameworksData";

const LanguageFrameworks = () => {
  const { currentLanguage, t } = useLocalization();
  const [activeTab, setActiveTab] = useState("cefr");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('language-frameworks.title')}</h1>
        <p className="text-muted-foreground">
          {t('language-frameworks.description')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cefr" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>CEFR</span>
          </TabsTrigger>
          <TabsTrigger value="actfl" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>ACTFL</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cefr" className="mt-6">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="mr-2 h-5 w-5" />
                <span>CEFR {t('language-frameworks.levels')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                {t('language-frameworks.cefr-description')}
              </p>
              
              {cefrLevels[currentLanguage] && (
                <CEFRLevels levels={cefrLevels[currentLanguage]} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actfl" className="mt-6">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Award className="mr-2 h-5 w-5" />
                <span>ACTFL {t('language-frameworks.levels')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                {t('language-frameworks.actfl-description')}
              </p>
              
              {actflLevels[currentLanguage] && (
                <ACTFLLevels levels={actflLevels[currentLanguage]} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LanguageFrameworks;
