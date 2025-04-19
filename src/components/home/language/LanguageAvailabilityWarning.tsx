
interface LanguageAvailabilityWarningProps {
  selectedPair: string;
  languagePairs: Record<string, string>;
}

const LanguageAvailabilityWarning = ({
  selectedPair,
  languagePairs
}: LanguageAvailabilityWarningProps) => {
  if (!selectedPair) return null;

  const selectedLanguageName = languagePairs[selectedPair]?.split(" ")[1] || selectedPair;

  return (
    <p className="text-amber-600 text-sm mb-2">
      {"Study materials for this language pair are coming soon!"}
      <br />
      {"Some features might be limited or unavailable."}
    </p>
  );
};

export default LanguageAvailabilityWarning;
