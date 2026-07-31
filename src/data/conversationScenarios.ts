/**
 * Conversation scenarios — the heart of the product.
 *
 * Each scenario gives the AI partner a persona and the learner a concrete,
 * real-life goal, so practice is never aimless chat. The server holds its own
 * copy of the persona/behavior prompts (supabase/functions/_shared/
 * conversationScenarios.ts); this client registry carries only learner-facing
 * copy. Keep ids in sync between the two files.
 *
 * Copy rule: learner-facing strings stay in short, simple English (A1-friendly).
 */

export type ScenarioLevel = "beginner" | "intermediate" | "advanced";

export interface ConversationScenario {
  id: string;
  emoji: string;
  title: string;
  /** One short line about the situation. */
  description: string;
  /** What the learner should try to do, phrased as "Try to…". */
  goal: string;
  level: ScenarioLevel;
  /** Featured scenarios get hero placement on the hub. */
  featured?: boolean;
}

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: "free-talk",
    emoji: "💬",
    title: "Just talk",
    description: "Talk about anything you want.",
    goal: "Try to keep the conversation going.",
    level: "beginner",
    featured: true,
  },
  {
    id: "new-friend",
    emoji: "👋",
    title: "Meet someone new",
    description: "You meet a friendly person for the first time.",
    goal: "Try to say your name and ask 2 questions.",
    level: "beginner",
  },
  {
    id: "cafe-order",
    emoji: "☕",
    title: "Order at a café",
    description: "You are hungry and thirsty at a small café.",
    goal: "Try to order a drink and some food.",
    level: "beginner",
  },
  {
    id: "directions",
    emoji: "🗺️",
    title: "Ask for directions",
    description: "You are lost in a new city.",
    goal: "Try to find out how to get to the station.",
    level: "beginner",
  },
  {
    id: "weekend-story",
    emoji: "🌤️",
    title: "Talk about your weekend",
    description: "A friend asks about your weekend.",
    goal: "Try to tell 3 things you did.",
    level: "beginner",
  },
  {
    id: "shopping-return",
    emoji: "🛍️",
    title: "Return something",
    description: "You bought a shirt but it is too small.",
    goal: "Try to explain the problem and change it.",
    level: "intermediate",
  },
  {
    id: "doctor-visit",
    emoji: "🩺",
    title: "See a doctor",
    description: "You do not feel well today.",
    goal: "Try to say what hurts and answer questions.",
    level: "intermediate",
  },
  {
    id: "phone-reschedule",
    emoji: "📞",
    title: "Change an appointment",
    description: "You call to move your appointment to a new day.",
    goal: "Try to agree on a new day and time.",
    level: "intermediate",
  },
  {
    id: "workplace-smalltalk",
    emoji: "🏢",
    title: "Small talk at work",
    description: "You chat with a coworker before a meeting.",
    goal: "Try to ask about their weekend and share yours.",
    level: "intermediate",
  },
  {
    id: "travel-plans",
    emoji: "✈️",
    title: "Plan a trip",
    description: "You and a friend plan a short trip together.",
    goal: "Try to agree where to go and when.",
    level: "intermediate",
  },
  {
    id: "job-interview",
    emoji: "💼",
    title: "Job interview",
    description: "A short, friendly job interview.",
    goal: "Try to talk about your work and your skills.",
    level: "advanced",
  },
  {
    id: "apartment-problem",
    emoji: "🔧",
    title: "Report a problem",
    description: "Something in your apartment does not work.",
    goal: "Try to explain the problem and ask for a fix.",
    level: "advanced",
  },
];

export function getScenario(id: string | null | undefined) {
  if (!id) return undefined;
  return CONVERSATION_SCENARIOS.find((s) => s.id === id);
}
