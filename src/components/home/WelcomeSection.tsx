
import { motion } from "framer-motion";
import { useLocalization } from "@/context/LocalizationContext";

const WelcomeSection = () => {
  const { t } = useLocalization();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
        {t("welcomeToLanguageLearning")}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        {t("yourPersonalAICompanion")}
      </p>
    </motion.div>
  );
};

export default WelcomeSection;
