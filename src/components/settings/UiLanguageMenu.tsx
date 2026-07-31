import React from "react";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUiLanguage } from "@/hooks/useUiLanguage";

/**
 * Compact globe dropdown for the app header: lets a signed-in learner switch
 * UI language from anywhere (the landing-page picker is unreachable once
 * signed in). Lists every loadable pack, including the previously
 * unselectable Karen, Tigrinya, Burmese, Marathi, and Sinhala.
 */
const UiLanguageMenu = () => {
  const { currentLanguage, setUiLanguage, options } = useUiLanguage();
  const current = options.find((o) => o.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 shrink-0 px-2"
          aria-label={`Language: ${current?.nativeName ?? currentLanguage}`}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline max-w-[7rem] truncate text-sm">
            {current?.nativeName ?? currentLanguage}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-56 overflow-y-auto">
        {options.map((option) => {
          const active = option.code === currentLanguage;
          return (
            <DropdownMenuItem
              key={option.code}
              onClick={() => setUiLanguage(option.code)}
              className={cn("flex items-center justify-between gap-2", active && "font-semibold")}
            >
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="truncate">{option.nativeName}</span>
                {option.nativeName !== option.englishName && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {option.englishName}
                  </span>
                )}
              </span>
              {active && <Check className="w-4 h-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UiLanguageMenu;
