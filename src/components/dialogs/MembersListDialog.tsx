
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/components/cards/ProjectCard";

interface MembersListDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MembersListDialog({ project, open, onOpenChange }: MembersListDialogProps) {

    const { data: members = [], isLoading, isError, error } = useQuery({
        queryKey: ['project-members', project?.id],
        queryFn: async () => {
            if (!project?.id) return [];
            const token = localStorage.getItem('token');
            return api.get(`/projects/${project.id}/members`, token);
        },
        enabled: !!project?.id && open
    });

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Jamoa A'zolari: {project.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8 text-destructive">
                            Xatolik yuz berdi: {(error as Error).message}
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            A'zolar topilmadi
                        </div>
                    ) : (
                        members.map((member: any) => (
                            <div key={member.id || member.user_id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border">
                                        <img src={member.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.email}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {member.full_name || member.email}
                                            {member.role === 'owner' && <Shield className="w-3 h-3 text-yellow-500" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {member.user_role ? JSON.parse(member.user_role)[0] : 'Member'} • {member.viloyat || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(member.joined_at || new Date()), 'dd MMM yyyy')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
