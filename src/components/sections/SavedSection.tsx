import { Bookmark, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProjectCard } from "@/components/cards/ProjectCard";

interface SavedSectionProps {
  onProjectClick?: (project: any) => void;
  onPersonClick?: (person: any) => void;
}

export function SavedSection({ onProjectClick, onPersonClick }: SavedSectionProps) {
  const { t } = useLanguage();

  const { data: savedProjects = [] } = useQuery({
    queryKey: ['saved-projects'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      return api.get('/projects/saved', token || undefined);
    }
  });

  const savedPeople: any[] = [];


  return (
    <div className="space-y-10">
      {/* Saved Projects */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{t("nav.saved")} {t("nav.projects").toLowerCase()}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {savedProjects.length}
          </span>
        </div>

        {savedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={{ ...project, is_saved: true }}
                index={index}
                onClick={() => onProjectClick?.(project)}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Hali saqlangan loyihalar yo'q" />
        )}
      </div>

      {/* Saved People */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{t("nav.saved")} {t("nav.people").toLowerCase()}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {savedPeople.length}
          </span>
        </div>

        <EmptyState message="Hali saqlangan odamlar yo'q" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass rounded-2xl p-12 text-center gradient-border">
      <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-lg text-muted-foreground mb-2">{message}</p>
      <p className="text-sm text-muted-foreground/70">
        Loyihalar va odamlarni saqlash funksiyasi tez orada qo'shiladi
      </p>
    </div>
  );
}
