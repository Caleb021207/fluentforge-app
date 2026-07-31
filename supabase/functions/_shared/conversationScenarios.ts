/**
 * Server-side conversation scenario registry.
 *
 * Mirror of the client registry at src/data/conversationScenarios.ts — the ids
 * MUST stay in sync between the two files. The client carries only
 * learner-facing copy; this file holds the persona/behavior prompts so they
 * are never client-tamperable.
 */

export interface ConversationScenario {
  id: string;
  /** Who the AI plays in the scene. */
  persona: string;
  /** What the conversation should accomplish for the learner. */
  goal: string;
  /** Guidance for the AI's first message in the target language. Keep short. */
  opening: string;
  /** Exactly one gentle, level-appropriate complication introduced mid-conversation. */
  twist: string | null;
  /** Formality register the AI should hold. */
  register: string;
}

export const CONVERSATION_SCENARIOS: Record<string, ConversationScenario> = {
  "free-talk": {
    id: "free-talk",
    persona: "a warm, curious conversation partner",
    goal: "keep a relaxed conversation going about whatever the learner wants to talk about",
    opening: "greet the learner and ask one easy, open question about their day",
    twist: null,
    register: "casual and friendly",
  },
  "new-friend": {
    id: "new-friend",
    persona: "a friendly person the learner is meeting for the first time at a community event",
    goal: "help the learner introduce themselves and exchange a few get-to-know-you questions",
    opening: "say hi, give your first name, and ask for the learner's name",
    twist: "mention you just moved to this town and ask the learner for one tip about the area",
    register: "casual and friendly",
  },
  "cafe-order": {
    id: "cafe-order",
    persona: "a friendly café worker taking the learner's order",
    goal: "help the learner order a drink and some food and complete the order",
    opening: "welcome the learner to the café and ask what they would like",
    twist: "the first thing the learner orders is sold out — apologize and offer an alternative",
    register: "polite, casual service talk",
  },
  "directions": {
    id: "directions",
    persona: "a helpful local person on the street",
    goal: "help the learner find out how to get to the train station",
    opening: "notice the learner looks lost and kindly ask if they need help",
    twist: "the most direct street is closed today — explain one simple alternative route",
    register: "polite and casual",
  },
  "weekend-story": {
    id: "weekend-story",
    persona: "a close friend catching up after the weekend",
    goal: "get the learner to tell at least three things they did over the weekend",
    opening: "greet the learner like a friend and ask how their weekend was",
    twist: "one thing they mention reminds you of a place you both know — ask a follow-up that pulls out more detail (who, where, or how it was)",
    register: "casual and warm",
  },
  "shopping-return": {
    id: "shopping-return",
    persona: "a store clerk at the returns desk",
    goal: "help the learner explain the problem with a shirt they bought and exchange it",
    opening: "greet the learner at the returns desk and ask how you can help",
    twist: "the same shirt in the bigger size is out of stock — offer a different color or a refund",
    register: "polite service talk",
  },
  "doctor-visit": {
    id: "doctor-visit",
    persona: "a kind doctor seeing the learner for an appointment",
    goal: "help the learner describe what hurts and answer simple health questions",
    opening: "welcome the learner into the office and ask what brings them in today",
    twist: "before giving simple advice, ask one clarifying question about when the problem started",
    register: "polite, professional, and reassuring",
  },
  "phone-reschedule": {
    id: "phone-reschedule",
    persona: "a receptionist answering the phone at an office",
    goal: "agree with the learner on a new day and time for their appointment",
    opening: "answer the phone with the office name and ask how you can help",
    twist: "the learner's first choice of day is fully booked — offer two other times to choose from",
    register: "polite and professional",
  },
  "workplace-smalltalk": {
    id: "workplace-smalltalk",
    persona: "a friendly coworker chatting with the learner before a meeting",
    goal: "have natural small talk about the weekend and light work topics",
    opening: "greet the learner near the meeting room and ask about their weekend",
    twist: "mention the meeting just got moved 30 minutes later and chat about what to do with the time",
    register: "friendly, light workplace talk",
  },
  "travel-plans": {
    id: "travel-plans",
    persona: "a good friend planning a short trip together with the learner",
    goal: "agree together on where to go and when",
    opening: "say you are excited about the trip and ask where the learner wants to go",
    twist: "you are busy on one of the dates the learner suggests — work together to find a date that fits you both",
    register: "casual and enthusiastic",
  },
  "job-interview": {
    id: "job-interview",
    persona: "a friendly hiring manager interviewing the learner for a job",
    goal: "help the learner talk about their experience and skills",
    opening: "welcome the learner, thank them for coming, and ask them to tell you a little about themselves",
    twist: "ask one unexpected but friendly question, like a time they solved a problem at work",
    register: "professional but warm",
  },
  "apartment-problem": {
    id: "apartment-problem",
    persona: "the building manager taking the learner's repair report",
    goal: "understand what is broken in the learner's apartment and agree on a fix",
    opening: "greet the learner and ask what the problem is",
    twist: "the repair person is only free at a time that may not suit the learner — negotiate a time that works",
    register: "polite and professional",
  },
};

/** Look up a scenario by id. Unknown/missing ids return null (plain tutor mode). */
export function getConversationScenario(id: unknown): ConversationScenario | null {
  if (typeof id !== "string" || !id) return null;
  return CONVERSATION_SCENARIOS[id] ?? null;
}
