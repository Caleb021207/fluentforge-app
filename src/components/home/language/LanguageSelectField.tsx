
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  options: Record<string, string>;
  disabled?: boolean;
  disabledOptions?: string[];
}

const LanguageSelectField = ({
  id,
  value,
  onChange,
  label,
  placeholder,
  options,
  disabled = false,
  disabledOptions = []
}: LanguageSelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50 max-h-[250px] overflow-y-auto">
          {Object.entries(options).map(([value, label]) => (
            <SelectItem 
              key={value} 
              value={value} 
              disabled={disabledOptions.includes(value)}
            >
              {label}
              {disabledOptions.includes(value) && " (Under Development)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelectField;
