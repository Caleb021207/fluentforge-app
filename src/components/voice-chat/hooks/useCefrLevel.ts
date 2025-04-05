
import { useLocalization } from "@/context/LocalizationContext";

export const useCefrLevel = () => {
  const { currentLanguage, t } = useLocalization();
  
  const getCEFRLevelDescription = () => {
    if (currentLanguage === "mandarin") {
      return "中级 - 能够讨论熟悉的话题";
    } else if (currentLanguage === "vietnamese") {
      return "Trung cấp - Có thể thảo luận về các chủ đề quen thuộc";
    } else if (currentLanguage === "french") {
      return "Intermédiaire - Peut discuter de sujets familiers";
    } else if (currentLanguage === "japanese") {
      return "中級 - 身近な話題につ��て議論できる";
    } else if (currentLanguage === "russian") {
      return "Средний - может обсуждать знакомые темы";
    }
    return t("cefrB1Description") || "Intermediate - Can discuss familiar topics";
  };
  
  const getPracticeLevelText = () => {
    if (currentLanguage === "mandarin") {
      return "练习水平";
    } else if (currentLanguage === "vietnamese") {
      return "Cấp độ thực hành";
    } else if (currentLanguage === "french") {
      return "Niveau de pratique";
    } else if (currentLanguage === "japanese") {
      return "練習レベル";
    } else if (currentLanguage === "russian") {
      return "Уровень практики";
    }
    return t("practiceLevel") || "Practice Level";
  };
  
  return {
    cefrLevel: 'B1',
    cefrDescription: getCEFRLevelDescription(),
    practiceLevelText: getPracticeLevelText()
  };
};
