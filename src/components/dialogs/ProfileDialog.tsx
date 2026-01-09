import { User, Mail, MapPin, Briefcase, Edit2 } from "lucide-react";
import { viloyatlar } from "@/data/viloyatlar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { EditProfileDialog } from "./EditProfileDialog";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, signIn } = useAuth(); // We can use a refresh function if we had one, but for now we'll just rely on the parent or re-fetching.
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const viloyatName = viloyatlar.find(v => v.id === user.profile?.viloyat)?.name || user.profile?.viloyat || "Noma'lum";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mening profilim</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 p-1 shadow-glow">
                  <img
                    src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt="Profil rasmi"
                    className="w-full h-full rounded-xl bg-background object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ism</p>
                    <p className="text-sm text-foreground font-medium">{user.profile?.full_name || 'Anonymous'}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joylashuv</p>
                    <p className="text-sm text-foreground font-medium">{viloyatName}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mutaxassislik</p>
                    <p className="text-sm text-foreground font-medium">{user.profile?.role || 'Tanlanmagan'}</p>
                  </div>
                </div>
              </div>

              {user.profile?.bio && (
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Men haqimda</p>
                  <p className="text-sm text-foreground leading-relaxed">{user.profile.bio}</p>
                </div>
              )}

              {(user.profile?.skills || []).length > 0 && (
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Ko'nikmalar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.profile.skills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Edit Button */}
            <Button className="w-full" onClick={() => setEditOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Profilni tahrirlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          // Token is already in localStorage, /auth/me should return updated data if we force a refresh
          // For now, let's assume the user refresh logic is handled or we can add it to context.
          window.location.reload(); // Simple way to refresh user data for now
        }}
      />
    </>
  );
}

