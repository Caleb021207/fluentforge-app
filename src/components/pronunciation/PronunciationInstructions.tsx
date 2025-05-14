
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PronunciationInstructions = () => {
  const { t } = useLocalization();

  const tips = [
    {
      title: t("listenCarefully"),
      content: t("listenCarefullyDescription")
    },
    {
      title: t("startSlowly"),
      content: t("startSlowlyDescription")
    },
    {
      title: t("payAttentionToFeedback"),
      content: t("payAttentionToFeedbackDescription")
    },
    {
      title: t("practiceRegularly"),
      content: t("practiceRegularlyDescription")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pronunciationTips")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {tips.map((tip, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{tip.title}</AccordionTrigger>
              <AccordionContent>
                {tip.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PronunciationInstructions;
