import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import getMyProgress from "./tools/get-my-progress";
import listCurriculum from "./tools/list-curriculum";
import listDueReviews from "./tools/list-due-reviews";
import listMyAssignments from "./tools/list-my-assignments";
import searchVocabulary from "./tools/search-vocabulary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-palavox-education",
  title: "Remix of Palavox Education",
  version: "0.1.0",
  instructions:
    "Tools for the Palavox English/ESL learning app. Read the signed-in user's profile and learning progress, browse the curriculum (courses, units, can-do statements), list due spaced-repetition vocabulary reviews, look up curriculum vocabulary, and list class assignments. All data is scoped to the signed-in user's permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    getMyProgress,
    listCurriculum,
    listDueReviews,
    listMyAssignments,
    searchVocabulary,
  ],
});
