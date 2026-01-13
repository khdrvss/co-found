import { X, MapPin, Sparkles, Bookmark, Share2, ExternalLink, Calendar, Users, Edit2, Trash2, Loader2, MessageCircle, UserPlus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Project } from "@/components/cards/ProjectCard";
import { viloyatlar } from "@/data/viloyatlar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn, getAvatarUrl } from "@/lib/utils";


import { PersonDetailDialog } from "./PersonDetailDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { Person } from "@/data/mockPeople";

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChat?: () => void;
  onEdit?: () => void; // Added onEdit prop
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

export function ProjectDetailDialog({ project, open, onOpenChange, onOpenChat, onEdit }: ProjectDetailDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<Person | null>(null);
  const [ownerProjects, setOwnerProjects] = useState<Project[]>([]);

  if (!project) return null;

  const isOwner = user && user.id === project.user_id;
  
  // Debug logging
  console.log("🔍 Ownership check:", {
    userId: user?.id,
    projectUserId: project.user_id,
    userEmail: user?.email,
    isOwner,
    projectTitle: project.name
  });
  
  const viloyatName = viloyatlar.find(v => v.id === project.viloyat)?.name || project.viloyat;

  const handleDelete = async () => {
    if (!confirm("Haqiqatan ham ushbu loyihani o'chirmoqchimisiz?")) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/projects/${project.id}`, token || undefined);
      toast({ title: "Loyiha muvaffaqiyatli o'chirildi" });
      onOpenChange(false);
      window.location.reload(); // Simple refresh
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleJoinRequest = async () => {
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
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "So'rov yuborishda xatolik",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.name,
          text: project.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Havola nusxalandi" });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookmark = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "O'chirildi" : "Saqlandi",
      description: isSaved ? "Loyiha saqlanganlardan o'chirildi" : "Loyiha saqlanganlarga qo'shildi",
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border w-full h-full sm:h-auto sm:max-w-2xl p-0 overflow-hidden max-h-screen sm:max-h-[90vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-br from-primary/30 via-chart-2/20 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.3),transparent_50%)]" />

          {/* Floating actions */}
          {/* Floating actions - Moved to left to avoid Close button overlap */}
          <div className="absolute top-3 sm:top-4 right-12 sm:right-14 flex gap-2">
            <button
              onClick={handleBookmark}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg glass transition-colors",
                isSaved ? "bg-primary/20 text-primary hover:bg-primary/30" : "hover:bg-secondary/80 text-foreground"
              )}
            >
              <Bookmark className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isSaved && "fill-current")} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 rounded-lg glass hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
            </button>
          </div>

          {/* Recommended badge */}
          {project.recommended && (
            <div className="absolute top-3 sm:top-4 left-4 sm:left-6 inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full glass text-xs text-primary font-medium">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t("card.recommended")}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-6 sm:-mt-8 relative">
          {/* Project icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mb-4 shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">
              {project.name.charAt(0)}
            </span>
          </div>

          {/* Title & location */}
          <h2 className="text-2xl font-bold text-foreground mb-2">{project.name}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{viloyatName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>2024</span>
            </div>
          </div>

          {/* Owner Info */}
          {project.user && (
            <div
              className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50 cursor-pointer group"
              onClick={async () => {
                try {
                  // If we already have the profile data, usage is simple. 
                  // But project.user is partial. We'll fetch all people and find the user (frontend solution for MVP)
                  // In a larger app, we'd use a specific endpoint /api/users/:id/profile

                  // Show simple loading feedback if needed, or just open dialog when ready
                  const usersResponse: any = await api.get('/people');
                  const projectsResponse: any = await api.get('/projects');
                  
                  const users = usersResponse.data || usersResponse;
                  const allProjects = projectsResponse.data || projectsResponse;

                  const ownerProfile = users.find((u: any) => u.user_id === project.user?.id || u.id === project.user?.id);
                  const ownerProjects = allProjects.filter((p: any) => p.user_id === project.user?.id);

                  if (ownerProfile) {
                    setOwnerProfile(ownerProfile);
                    setOwnerProjects(ownerProjects);
                  } else {
                    toast({ title: "Profil topilmadi", variant: "destructive" });
                  }
                } catch (e) {
                  console.error(e);
                  toast({ title: "Xatolik", description: "Profilni yuklashda xatolik", variant: "destructive" });
                }
              }}
            >
              <img
                src={project.user.profile?.avatar_url || getAvatarUrl(project.user.email)}
                alt={project.user.profile?.full_name || 'Owner'}
                className="w-10 h-10 rounded-full ring-2 ring-border group-hover:ring-primary transition-all"
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Loyiha egasi</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {project.user.profile?.full_name || project.user.email}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>
          )}

          <PersonDetailDialog
            person={ownerProfile}
            projects={ownerProjects}
            open={!!ownerProfile}
            onOpenChange={(open) => !open && setOwnerProfile(null)}
          />

          <EditProjectDialog 
            project={project} 
            open={isEditing} 
            onOpenChange={setIsEditing}
            onSuccess={() => {
              setIsEditing(false);
              window.location.reload();
            }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border",
              categoryColors[project.category] || categoryColors["Startup"]
            )}>
              {project.category}
            </span>
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border",
              stageColors[project.stage] || stageColors["G'oya"]
            )}>
              {project.stage}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">Loyiha haqida</h3>
            <p className="text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Looking For */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t("card.lookingFor")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(project.lookingFor || []).map((role) => (

                <span
                  key={role}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isOwner ? (
              <Button
                className="w-full sm:flex-1 h-12 text-base gap-2 shadow-glow hover:shadow-glow-lg transition-shadow bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                onClick={() => {
                  onOpenChange(false);
                  onOpenChat?.();
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Guruhga o'tish
              </Button>
            ) : (
              <Button
                className="w-full sm:flex-1 h-12 text-base gap-2 shadow-glow hover:shadow-glow-lg transition-shadow"
                onClick={handleJoinRequest}
                disabled={isJoining}
              >
                <UserPlus className="w-4 h-4" />
                {isJoining ? "Yuborilmoqda..." : "Qo'shilish"}
              </Button>
            )}

            {isOwner && (
              <div className="flex gap-2 w-full mt-2 sm:mt-0 sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  O'chirish
                </Button>
              </div>
            )}
          </div>

        </div>
      </DialogContent>

    </Dialog>
  );
}
