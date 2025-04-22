
interface LanguageAvailabilityWarningProps {
  targetLanguage: string;
  nativeLanguage: string;
  targetLanguageNames: Record<string, string>;
  nativeLanguageNames: Record<string, string>;
}

const LanguageAvailabilityWarning = ({
  targetLanguage,
  nativeLanguage,
  targetLanguageNames,
  nativeLanguageNames
}: LanguageAvailabilityWarningProps) => {
  if (!targetLanguage || !nativeLanguage) return null;

  return (
    <p className="text-amber-600 text-sm mb-2">
      {`Study materials for learning ${targetLanguageNames[targetLanguage]?.split(" ")[1] || targetLanguage} from ${nativeLanguageNames[nativeLanguage]?.split(" ")[1] || nativeLanguage} are coming soon!`}
      <br />
      {"Some features might be limited or unavailable."}
    </p>
  );
};

export default LanguageAvailabilityWarning;
