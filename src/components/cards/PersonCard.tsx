import { Bookmark, MessageCircle, Sparkles, MapPin, Briefcase } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { Person } from "@/data/mockPeople";
import { viloyatlar } from "@/data/viloyatlar";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonCardProps {
  person: Person;
  index?: number;
  onClick?: () => void;
}

export function PersonCard({ person, index = 0, onClick }: PersonCardProps) {
  const viloyatName = viloyatlar.find(v => v.id === person.viloyat)?.name || person.viloyat || 'N/A';
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;
  const { t } = useLanguage();

  // Safe property access with fallbacks
  const personName = person.name || person.full_name || 'Anonymous';
  const personAvatar = person.avatar || person.avatar_url || getAvatarUrl(personName);
  const personRole = person.role || (Array.isArray(person.roles) ? person.roles[0] : person.roles) || 'Foydalanuvchi';
  const personBio = person.bio || '';
  const personSkills = person.skills || [];
  const personLookingFor = person.lookingFor || person.looking_for || '';
  const isAvailable = person.available !== undefined ? person.available : true;

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-5 group cursor-pointer",
        "gradient-border card-shine",
        "opacity-0 animate-fade-in-up",
        "hover:bg-card/80 hover:shadow-glow transition-all duration-500",
        staggerClass
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="relative shrink-0">
            <img
              src={personAvatar}
              alt={personName}
              className="w-14 h-14 rounded-xl object-cover bg-secondary ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300"
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card transition-all duration-300",
                isAvailable ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            {personLookingFor && (
              <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-2 animate-float">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">{personLookingFor}</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
              {personName}
            </h3>
            <p className="text-sm text-primary font-medium">{personRole}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{viloyatName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 icon-glow"
          >
            <Bookmark className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Bio */}
      {personBio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {personBio}
        </p>
      )}

      {/* Skills */}
      {personSkills.length > 0 && (
        <div className="mb-4">
          <span className="text-xs text-muted-foreground font-medium">{t("card.skills") || "Ko'nikmalar"}</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {personSkills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md bg-secondary/80 text-xs text-secondary-foreground hover:bg-secondary transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:shadow-glow-lg flex items-center justify-center gap-2 group/btn relative overflow-hidden"
      >
        <MessageCircle className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
        <span className="relative z-10">{t("card.contact")}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-shimmer" />
      </button>
    </div>
  );
}
