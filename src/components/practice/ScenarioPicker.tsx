import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CONVERSATION_SCENARIOS,
  type ConversationScenario,
  type ScenarioLevel,
} from "@/data/conversationScenarios";
import { getScenarioIcon } from "./scenarioIcons";

interface ScenarioPickerProps {
  onSelect: (id: string) => void;
}

const LEVEL_ORDER: ScenarioLevel[] = ["beginner", "intermediate", "advanced"];

/** Each level group gets its own brand stop, so the ramp reads as a journey. */
const LEVEL_DOT: Record<ScenarioLevel, string> = {
  beginner: "bg-brand-sky",
  intermediate: "bg-brand-azure",
  advanced: "bg-brand-mint",
};

/**
 * The hero of the practice page: pick a conversation like picking an
 * adventure. Featured scenarios get a full-width gradient-border card;
 * the rest are grouped by level under quiet gradient dividers.
 * Purely presentational — selection is delegated to the parent.
 */
const ScenarioPicker = ({ onSelect }: ScenarioPickerProps) => {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? undefined
        : { staggerChildren: 0.04, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  const featured = CONVERSATION_SCENARIOS.filter((s) => s.featured);
  const grouped = LEVEL_ORDER.map((level) => ({
    level,
    scenarios: CONVERSATION_SCENARIOS.filter(
      (s) => s.level === level && !s.featured
    ),
  })).filter((group) => group.scenarios.length > 0);

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label="Choose a conversation"
      className="space-y-5"
    >
      <motion.h2
        variants={item}
        className="text-xl font-bold tracking-tight sm:text-2xl"
      >
        Choose a conversation
      </motion.h2>

      {featured.map((scenario) => (
        <FeaturedScenarioCard
          key={scenario.id}
          scenario={scenario}
          onSelect={onSelect}
          variants={item}
        />
      ))}

      {grouped.map(({ level, scenarios }) => (
        <div key={level} className="space-y-3">
          <motion.div
            variants={item}
            className="flex items-center gap-2.5 pt-1"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[level]}`}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {level}
            </span>
            <span className="divider-gradient flex-1" aria-hidden />
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={onSelect}
                variants={item}
              />
            ))}
          </div>
        </div>
      ))}
    </motion.section>
  );
};

interface CardProps {
  scenario: ConversationScenario;
  onSelect: (id: string) => void;
  variants: Variants;
}

/** Full-width hero treatment for featured scenarios ("Just talk"). */
const FeaturedScenarioCard = ({ scenario, onSelect, variants }: CardProps) => {
  const Icon = getScenarioIcon(scenario.id);
  return (
  <motion.button
    type="button"
    variants={variants}
    onClick={() => onSelect(scenario.id)}
    className="gradient-border sheen group relative w-full overflow-hidden rounded-2xl bg-card/70 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand active:translate-y-0 sm:p-6"
  >
    <div className="flex items-center gap-4 sm:gap-5">
      <span
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16"
      >
        <Icon className="h-7 w-7 text-accent sm:h-8 sm:w-8" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-bold leading-tight tracking-tight sm:text-xl">
          {scenario.title}
        </span>
        <span className="mt-1 block text-sm leading-snug text-muted-foreground sm:text-base">
          {scenario.description}
        </span>
        <span className="mt-1.5 block text-sm font-medium leading-snug text-accent">
          {scenario.goal}
        </span>
      </span>
    </div>
  </motion.button>
  );
};

/** Compact adventure card: icon tile, title, goal. Level comes from the group. */
const ScenarioCard = ({ scenario, onSelect, variants }: CardProps) => {
  const Icon = getScenarioIcon(scenario.id);
  return (
  <motion.button
    type="button"
    variants={variants}
    onClick={() => onSelect(scenario.id)}
    className="group flex min-h-[44px] w-full items-start gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-sky/50 hover:bg-brand-sky/[0.06] hover:shadow-brand active:translate-y-0"
  >
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft transition-transform duration-300 group-hover:scale-110"
    >
      <Icon className="h-5 w-5 text-accent" />
    </span>
    <span className="min-w-0">
      <span className="block font-semibold leading-snug">{scenario.title}</span>
      <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
        {scenario.goal}
      </span>
    </span>
  </motion.button>
  );
};

export default ScenarioPicker;
