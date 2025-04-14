
import { useLocalization } from "@/context/LocalizationContext";

const FrenchPageHeader = () => {
  const { t } = useLocalization();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Premium French Voice Practice
      </h1>
      <p className="text-gray-600 mb-4">
        Have natural voice conversations with our premium AI tutor to practice French! The AI will help correct your grammar, 
        vocabulary, and provide tips on French pronunciation and culture.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm font-normal">
          Premium voice chat allows for 10 minutes of practice time weekly. Your time resets every Monday at 6:00 AM Central Time.
        </p>
      </div>
    </div>
  );
};

export default FrenchPageHeader;
