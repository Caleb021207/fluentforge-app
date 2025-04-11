
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const FrenchConversationStarters = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-lingua-primary" />
          French Conversation Starters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3">
          Try these phrases to practice your French conversation skills:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Basic Greetings:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex flex-col">
                <span className="font-medium">Bonjour, comment allez-vous?</span>
                <span className="text-gray-500 italic">Hello, how are you?</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium">Je m'appelle [your name].</span>
                <span className="text-gray-500 italic">My name is [your name].</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium">Enchanté(e) de faire votre connaissance.</span>
                <span className="text-gray-500 italic">Pleased to meet you.</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Practice Questions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex flex-col">
                <span className="font-medium">Pouvez-vous me parler de la cuisine française?</span>
                <span className="text-gray-500 italic">Can you tell me about French cuisine?</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium">Comment dit-on ___ en français?</span>
                <span className="text-gray-500 italic">How do you say ___ in French?</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium">Quelle est la différence entre "tu" et "vous"?</span>
                <span className="text-gray-500 italic">What's the difference between "tu" and "vous"?</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrenchConversationStarters;
