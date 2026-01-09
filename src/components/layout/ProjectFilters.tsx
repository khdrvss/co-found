import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Bookmark, Filter, ChevronDown, MapPin, Briefcase, Layers, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { viloyatlar } from "@/data/viloyatlar";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface ProjectFiltersProps {
    filters: {
        aiRating: boolean;
        myProjects: boolean;
        category: string | null;
        location: string | null;
        stage: string | null;
        workType: string | null;
    };
    onFilterChange: (key: string, value: any) => void;
    counts: {
        total: number;
        filtered: number;
    };
}

export function ProjectFilters({ filters, onFilterChange, counts }: ProjectFiltersProps) {
    const { t, language } = useLanguage();

    const categories = ["Startup", "SaaS", "AI", "Web3", "Fintech", "EdTech", "E-commerce", "HealthTech"];
    const stages = ["G'oya", "MVP", "Qurilmoqda", "Kengaymoqda"];
    const workTypes = [
        { value: "office", label: language === "ru" ? "В офисе" : "Ofisda" },
        { value: "remote", label: language === "ru" ? "Удалённо" : "Masofaviy" },
        { value: "hybrid", label: language === "ru" ? "Гибрид" : "Aralash" },
    ];

    return (
        <div className="w-full space-y-4 animate-fade-in-up stagger-1">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* AI Rating Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFilterChange("aiRating", !filters.aiRating)}
                    className={cn(
                        "h-9 rounded-full px-4 gap-2 transition-all border-dashed",
                        filters.aiRating
                            ? "bg-primary/10 text-primary border-primary shadow-glow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">AI Rating</span>
                </Button>

                {/* My Projects / Bookmarks Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFilterChange("myProjects", !filters.myProjects)}
                    className={cn(
                        "h-9 rounded-full px-4 gap-2 transition-all border-dashed",
                        filters.myProjects
                            ? "bg-secondary text-secondary-foreground border-secondary-foreground/20"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                        {language === "ru" ? "Мои проекты" : "Saqlanganlar"}
                    </span>
                </Button>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* Category Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-9 rounded-full px-3 gap-1.5", filters.category && "bg-secondary text-secondary-foreground border-transparent")}>
                            <Layers className="w-3.5 h-3.5" />
                            <span className="text-xs">{filters.category || (language === "ru" ? "Категория" : "Kategoriya")}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>{language === "ru" ? "Выберите категорию" : "Kategoriya tanlang"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.category || ""} onValueChange={(val) => onFilterChange("category", val || null)}>
                            <DropdownMenuRadioItem value="">
                                {language === "ru" ? "Все" : "Barchasi"}
                            </DropdownMenuRadioItem>
                            {categories.map((cat) => (
                                <DropdownMenuRadioItem key={cat} value={cat}>
                                    {cat}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Location Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-9 rounded-full px-3 gap-1.5", filters.location && "bg-secondary text-secondary-foreground border-transparent")}>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs">
                                {filters.location
                                    ? viloyatlar.find(v => v.id === filters.location)?.name
                                    : (language === "ru" ? "Локация" : "Lokatsiya")}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>{language === "ru" ? "Выберите регион" : "Hududni tanlang"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.location || ""} onValueChange={(val) => onFilterChange("location", val || null)}>
                            <DropdownMenuRadioItem value="">
                                {language === "ru" ? "Весь Узбекистан" : "Butun O'zbekiston"}
                            </DropdownMenuRadioItem>
                            {viloyatlar.map((v) => (
                                <DropdownMenuRadioItem key={v.id} value={v.id}>
                                    {v.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Stage Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-9 rounded-full px-3 gap-1.5", filters.stage && "bg-secondary text-secondary-foreground border-transparent")}>
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="text-xs">{filters.stage || (language === "ru" ? "Стадия" : "Bosqich")}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuLabel>{language === "ru" ? "Стадия проекта" : "Loyiha bosqichi"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.stage || ""} onValueChange={(val) => onFilterChange("stage", val || null)}>
                            <DropdownMenuRadioItem value="">
                                {language === "ru" ? "Все" : "Barchasi"}
                            </DropdownMenuRadioItem>
                            {stages.map((s) => (
                                <DropdownMenuRadioItem key={s} value={s}>
                                    {s}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Work Type Dropdown (Team Size equivalent) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-9 rounded-full px-3 gap-1.5", filters.workType && "bg-secondary text-secondary-foreground border-transparent")}>
                            <Laptop className="w-3.5 h-3.5" />
                            <span className="text-xs">
                                {filters.workType
                                    ? workTypes.find(w => w.value === filters.workType)?.label
                                    : (language === "ru" ? "Тип работы" : "Ish turi")}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuLabel>{language === "ru" ? "Format работы" : "Ish formati"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.workType || ""} onValueChange={(val) => onFilterChange("workType", val || null)}>
                            <DropdownMenuRadioItem value="">
                                {language === "ru" ? "Любой" : "Barchasi"}
                            </DropdownMenuRadioItem>
                            {workTypes.map((wt) => (
                                <DropdownMenuRadioItem key={wt.value} value={wt.value}>
                                    {wt.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters Button (only shows if any filter is active) */}
                {Object.values(filters).some(v => !!v) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onFilterChange("reset", null);
                        }}
                        className="h-9 px-3 text-muted-foreground hover:text-destructive text-xs ml-auto"
                    >
                        {language === "ru" ? "Сбросить" : "Tozalash"}
                    </Button>
                )}
            </div>

            {/* Results Counter */}
            <div className="text-center">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language === "ru" ? "Найдено проектов" : "Topilgan loyihalar"}:
                    <span className="text-primary ml-1">
                        <AnimatedCounter value={counts.filtered} />
                    </span>
                </span>
            </div>
        </div>
    );
}
