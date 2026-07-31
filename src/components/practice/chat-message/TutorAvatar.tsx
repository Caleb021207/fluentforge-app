import React from "react";
import { Sparkles } from "lucide-react";

/** Small brand-gradient badge that marks tutor messages. Decorative only. */
const TutorAvatar = () => (
  <span
    aria-hidden
    className="mb-1 flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-brand-gradient shadow-brand"
  >
    <Sparkles className="h-4 w-4 text-[#06263A]" />
  </span>
);

export default TutorAvatar;
