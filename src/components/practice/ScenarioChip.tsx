import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Target } from "lucide-react";
import type { ConversationScenario } from "@/data/conversationScenarios";

interface ScenarioChipProps {
  scenario: ConversationScenario;
  onChange: () => void;
}

/**
 * Compact header for the active scenario: emoji, title, and the goal styled
 * as a quest objective, with an elegant "Change" affordance.
 */
const ScenarioChip = ({ scenario, onChange }: ScenarioChipProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="gradient-border relative rounded-2xl bg-card/70 backdrop-blur-xl"
    >
      <div className="p-4 sm:p-5">
        {/* Top row: emoji + title + Change. The goal gets its own full-width
            row below so it never gets crushed between siblings on phones. */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-xl bg-brand-soft text-2xl"
          >
            {scenario.emoji}
          </span>

          <p className="min-w-0 flex-1 truncate font-bold leading-tight tracking-tight">
            {scenario.title}
          </p>

          <Button
            variant="outline"
            onClick={onChange}
            className="shrink-0 gap-2"
          >
            <RefreshCw aria-hidden className="h-4 w-4" />
            Change
          </Button>
        </div>

        <p className="mt-2.5 inline-flex max-w-full items-start gap-1.5 rounded-lg bg-brand-soft px-2.5 py-1 text-sm font-medium leading-snug sm:ml-16">
          <Target
            aria-hidden
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
          />
          <span className="min-w-0">{scenario.goal}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ScenarioChip;
