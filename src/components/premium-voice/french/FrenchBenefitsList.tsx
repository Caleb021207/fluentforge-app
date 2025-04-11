
import { Volume2, Headphones, Clock, GraduationCap, Globe } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const FrenchBenefitsList = () => {
  const { t } = useLocalization();

  return (
    <div className="mt-8 bg-gray-100 rounded-lg p-6">
      <h3 className="font-semibold mb-3">
        Benefits of Premium French Voice Chat
      </h3>
      <ul className="space-y-3">
        <li className="flex items-start gap-2">
          <Volume2 className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>Natural, human-like voice interaction with accurate French pronunciation and accent</span>
        </li>
        <li className="flex items-start gap-2">
          <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>Practice with an AI tutor that specializes in French language learning</span>
        </li>
        <li className="flex items-start gap-2">
          <GraduationCap className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>Get targeted feedback on your French grammar, vocabulary, and pronunciation</span>
        </li>
        <li className="flex items-start gap-2">
          <Globe className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>Learn about French culture, customs, and regional expressions</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>10 minutes of practice time weekly, with resets every Monday at 6:00 AM Central Time</span>
        </li>
      </ul>
    </div>
  );
};

export default FrenchBenefitsList;
