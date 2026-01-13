import { MapPin, Sparkles, Bookmark, Share2, MessageCircle, Mail, ExternalLink, Briefcase, Send, Instagram, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Person } from "@/data/mockPeople";
import { viloyatlar } from "@/data/viloyatlar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

import { Project } from "@/components/cards/ProjectCard";

interface PersonDetailDialogProps {
  person: Person | null;
  projects?: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPrivateChat?: (payload: { partnerId: string; partnerName: string; partnerAvatar?: string }) => void;
}

export function PersonDetailDialog({ person, projects, open, onOpenChange, onOpenPrivateChat }: PersonDetailDialogProps) {
  const { t } = useLanguage();


  const [isSaved, setIsSaved] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: person?.name || person?.full_name || 'Co-Found Profile',
          text: person?.bio || 'Check out this profile on Co-Found',
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
      description: isSaved ? "Profil saqlanganlardan o'chirildi" : "Profil saqlanganlarga qo'shildi",
    });
  };

  const handleOpenPrivateChat = () => {
    if (!person) return;
    // Close this dialog first
    onOpenChange(false);
    // Ask parent to open private chat (app-level) with partner details
    onOpenPrivateChat?.({ partnerId: person.user_id || person.id, partnerName: person.full_name || person.name || person.email || 'Partner', partnerAvatar: person.avatar || person.avatar_url });
  };

  if (!person) return null;

  // Safe property access with fallbacks
  const personName = person.name || person.full_name || person.email || 'Anonymous';
  const personAvatar = person.avatar || person.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${personName}`;
  const isAvailable = person.available ?? true;
  const personRole = person.role || (Array.isArray(person.roles) ? person.roles[0] : person.roles) || 'Foydalanuvchi';
  const viloyatName = viloyatlar.find(v => v.id === person.viloyat)?.name || person.viloyat || 'Noma\'lum';
  const personBio = person.bio || 'Ma\'lumot kiritilmagan';
  const personSkills = person.skills || [];
  const personLookingFor = person.looking_for || null;
  const hasSocialLinks = !!(person.telegram_url || person.instagram_url || person.linkedin_url);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass border-border w-full h-full sm:h-auto sm:max-w-lg p-0 overflow-hidden max-h-screen sm:max-h-[90vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="relative h-20 sm:h-28 bg-gradient-to-br from-chart-2/30 via-primary/20 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--chart-2)/0.3),transparent_50%)]" />

            {/* Floating actions */}
            {/* Floating actions */}
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
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-10 sm:-mt-12 relative">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 p-0.5 shadow-glow">
                <img
                  src={personAvatar}
                  alt={personName}
                  className="w-full h-full rounded-2xl object-cover bg-background"
                />
              </div>
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-background",
                  isAvailable ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-muted-foreground"
                )}
              />
            </div>

            {/* Name & role */}
            <h2 className="text-2xl font-bold text-foreground mb-1">{personName}</h2>
            <p className="text-primary font-medium mb-2">{personRole}</p>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{viloyatName}</span>
              <span className="mx-2">•</span>
              <span className={isAvailable ? "text-green-500" : "text-muted-foreground"}>
                {isAvailable ? "Mavjud" : "Band"}
              </span>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-muted-foreground leading-relaxed">
                {personBio}
              </p>
            </div>

            {/* Skills */}
            {personSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Ko'nikmalar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {personSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Looking For */}
            {personLookingFor && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-sm">Qidirayotgan narsasi</span>
                </div>
                <p className="text-foreground">{personLookingFor}</p>
              </div>
            )}

            {/* Social Media Links */}
            {hasSocialLinks && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Ijtimoiy tarmoqlar</h3>
                <div className="flex gap-2">
                  {person.telegram_url && (
                    <a
                      href={person.telegram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass hover:bg-secondary/80 transition-all duration-200 group"
                    >
                      <Send className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-foreground">Telegram</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {person.instagram_url && (
                    <a
                      href={person.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass hover:bg-secondary/80 transition-all duration-200 group"
                    >
                      <Instagram className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-foreground">Instagram</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {person.linkedin_url && (
                    <a
                      href={person.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass hover:bg-secondary/80 transition-all duration-200 group"
                    >
                      <Linkedin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-foreground">LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* User Projects */}
            {projects && projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Loyihalar ({projects.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {projects.map(project => (
                    <div key={project.id} className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center shrink-0">
                        <span className="font-bold text-primary">{project.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-sm font-medium truncate">{project.name}</h4>
                          {project.recommended && <Sparkles className="w-3 h-3 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3">
              <Button
                onClick={handleOpenPrivateChat}
                className="flex-1 h-12 text-base gap-2 shadow-glow hover:shadow-glow-lg transition-shadow"
              >
                <MessageCircle className="w-4 h-4" />
                {t("card.contact")}
              </Button>
              <Button variant="outline" className="h-12 px-6 gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
