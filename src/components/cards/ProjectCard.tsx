import { Bookmark, Share2, Sparkles, MapPin, ArrowRight, Home, Laptop, Building2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { viloyatlar } from "@/data/viloyatlar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  recommended?: boolean;
  lookingFor: string[];
  viloyat: string;
  workType?: "remote" | "hybrid" | "office";
  user?: {
    id: string;
    email: string;
    profile?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  is_saved?: boolean;
}


interface ProjectCardProps {
  project: Project;
  index?: number;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  "Startup": "bg-primary/20 text-primary border-primary/30",
  "SaaS": "bg-accent/20 text-accent border-accent/30",
  "AI": "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "Web3": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "Fintech": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "EdTech": "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

const stageColors: Record<string, string> = {
  "G'oya": "bg-muted text-muted-foreground border-border",
  "MVP": "bg-primary/10 text-primary border-primary/20",
  "Qurilmoqda": "bg-accent/10 text-accent border-accent/20",
  "Kengaymoqda": "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const workTypeConfig = {
  remote: {
    icon: Laptop,
    labelUz: "Masofaviy",
    labelRu: "Удалённо",
    className: "bg-chart-2/20 text-chart-2 border-chart-2/30"
  },
  hybrid: {
    icon: Home,
    labelUz: "Aralash",
    labelRu: "Гибрид",
    className: "bg-chart-4/20 text-chart-4 border-chart-4/30"
  },
  office: {
    icon: Building2,
    labelUz: "Ofisda",
    labelRu: "В офисе",
    className: "bg-muted text-muted-foreground border-border"
  },
};

export function ProjectCard({ project, index = 0, onClick }: ProjectCardProps) {
  const viloyatName = viloyatlar.find(v => v.id === project.viloyat)?.name || project.viloyat;
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isSaved, setIsSaved] = useState(project.is_saved || false);
  const [isSaving, setIsSaving] = useState(false);
  const workType = project.workType || "office";
  const WorkTypeIcon = workTypeConfig[workType].icon;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Tizimga kiring",
        description: "Loyihani saqlash uchun tizimga kiring",
        variant: "destructive"
      });
      return;
    }

    // Optimistic update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      await api.post(`/projects/${project.id}/save`, {}, token || undefined);
      toast({
        title: newSavedState ? "Saqlandi" : "Saqlash bekor qilindi",
        description: newSavedState ? "Loyiha saqlanganlar ro'yxatiga qo'shildi" : "Loyiha saqlanganlardan olib tashlandi"
      });
    } catch (error) {
      // Revert on error
      setIsSaved(!newSavedState);
      toast({
        title: "Xatolik",
        description: "Saqlashda xatolik yuz berdi",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoinRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Tizimga kiring",
        description: "Loyihaga qo'shilish uchun tizimga kirishingiz kerak",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/projects/${project.id}/join`, {}, token || undefined);
      toast({
        title: "So'rov yuborildi!",
        description: "Loyiha egasi sizning so'rovingizni ko'rib chiqadi"
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "So'rov yuborishda xatolik",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-5 group cursor-pointer",
        "gradient-border card-shine",
        "opacity-0 animate-fade-in-up",
        "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out",
        "hover:shadow-glow-purple",
        staggerClass
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {project.recommended && (
            <div className="inline-flex items-center gap-1.5 text-xs text-primary mb-2 animate-float">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">{t("card.recommended")}</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {project.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{viloyatName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 icon-glow"
          >
            <Bookmark className={cn(
              "w-4 h-4 transition-colors",
              isSaved ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
            )} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 icon-glow"
          >
            <Share2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {project.description}
      </p>

      {/* Owner */}
      {project.user && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
          <img
            src={project.user.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.user.email}`}
            alt={project.user.profile?.full_name || 'Owner'}
            className="w-6 h-6 rounded-full ring-1 ring-border"
          />
          <span className="text-xs text-muted-foreground">
            {project.user.profile?.full_name || project.user.email}
          </span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105",
          categoryColors[project.category] || categoryColors["Startup"]
        )}>
          {project.category}
        </span>
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105",
          stageColors[project.stage] || stageColors["G'oya"]
        )}>
          {project.stage}
        </span>
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105 flex items-center gap-1",
          workTypeConfig[workType].className
        )}>
          <WorkTypeIcon className="w-3 h-3" />
          {language === "ru" ? workTypeConfig[workType].labelRu : workTypeConfig[workType].labelUz}
        </span>
      </div>

      {/* Looking For */}
      <div className="mb-4">
        <span className="text-xs text-muted-foreground font-medium">{t("card.lookingFor")}</span>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {project.lookingFor.map((role) => (
            <span
              key={role}
              className="px-2.5 py-1 rounded-md bg-secondary/80 text-xs text-secondary-foreground hover:bg-secondary transition-colors duration-200"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleJoinRequest}
        disabled={isJoining}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:shadow-glow-lg group/btn flex items-center justify-center gap-2 overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="w-4 h-4 relative z-10" />
        <span className="relative z-10">{isJoining ? "Yuborilmoqda..." : "Qo'shilish"}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-shimmer" />
      </button>
    </div>
  );
}
