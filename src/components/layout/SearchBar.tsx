import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative glass rounded-2xl px-5 py-3 flex items-center gap-4 glow-hover">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("search.placeholder")}
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
