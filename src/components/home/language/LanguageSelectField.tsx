
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LanguageSelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  // Accept both legacy Record<string, string> or new array of options
  options: Record<string, string> | LanguageSelectOption[];
  disabled?: boolean;
}

const LanguageSelectField = ({
  id,
  value,
  onChange,
  label,
  placeholder,
  options,
  disabled = false
}: LanguageSelectFieldProps) => {
  // Normalize options to array
  let optionsArray: LanguageSelectOption[];
  if (Array.isArray(options)) {
    optionsArray = options;
  } else {
    // Support old API: assume all enabled
    optionsArray = Object.entries(options).map(([value, label]) => ({
      value,
      label
    }));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full" />
        <SelectContent>
          {optionsArray.map(opt => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={!!opt.disabled}
              className={opt.disabled ? "opacity-50 pointer-events-none select-none" : ""}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelectField;
