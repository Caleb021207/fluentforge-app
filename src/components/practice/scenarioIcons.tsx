import {
  Briefcase,
  Coffee,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plane,
  ShoppingBag,
  Stethoscope,
  Sun,
  UserPlus,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * One brand icon per conversation scenario (owner call: icons, not emojis).
 * Kept beside the practice components because it is purely presentational;
 * the scenario data itself lives in src/data/conversationScenarios.ts.
 */
const SCENARIO_ICONS: Record<string, LucideIcon> = {
  "free-talk": MessagesSquare,
  "new-friend": UserPlus,
  "cafe-order": Coffee,
  directions: MapPin,
  "weekend-story": Sun,
  "shopping-return": ShoppingBag,
  "doctor-visit": Stethoscope,
  "phone-reschedule": Phone,
  "workplace-smalltalk": Users,
  "travel-plans": Plane,
  "job-interview": Briefcase,
  "apartment-problem": Wrench,
};

export function getScenarioIcon(id: string): LucideIcon {
  return SCENARIO_ICONS[id] ?? MessageCircle;
}
