
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerbTensesContent from "./grammar/VerbTensesContent";
import SentenceStructureContent from "./grammar/SentenceStructureContent";
import PronounsContent from "./grammar/PronounsContent";
import SpecialUsesContent from "./grammar/SpecialUsesContent";

const GrammarRules = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Spanish Grammar Rules</h2>
        <p className="text-muted-foreground mb-4">
          Master the essential grammar rules for Spanish at all levels. Select a category below to explore different grammar concepts.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle>Grammar Categories</CardTitle>
          <CardDescription>
            Choose a category to view detailed explanations and examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verb-tenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
              <TabsTrigger value="verb-tenses" className="whitespace-nowrap">Verb Tenses</TabsTrigger>
              <TabsTrigger value="sentence-structure" className="whitespace-nowrap">Sentence Structure</TabsTrigger>
              <TabsTrigger value="pronouns" className="whitespace-nowrap">Pronouns</TabsTrigger>
              <TabsTrigger value="special-uses" className="whitespace-nowrap">Special Uses</TabsTrigger>
            </TabsList>

            <TabsContent value="verb-tenses" className="mt-4">
              <VerbTensesContent />
            </TabsContent>

            <TabsContent value="sentence-structure" className="mt-4">
              <SentenceStructureContent />
            </TabsContent>

            <TabsContent value="pronouns" className="mt-4">
              <PronounsContent />
            </TabsContent>

            <TabsContent value="special-uses" className="mt-4">
              <SpecialUsesContent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarRules;
