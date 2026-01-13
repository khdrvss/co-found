import { useState } from "react";
import { Edit, Trash2, Users, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { ProjectCard, Project } from "@/components/cards/ProjectCard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MyProjectsSectionProps {
    onProjectClick?: (project: Project) => void;
    onEditProject?: (project: Project) => void;
    onViewRequests?: (project: Project) => void;
    onViewMembers?: (project: Project) => void;
    onOpenChat?: (project: Project) => void;
}

import { ProjectChatDialog } from "@/components/dialogs/ProjectChatDialog";
import { RequestsListDialog } from "@/components/dialogs/RequestsListDialog";
import { MembersListDialog } from "@/components/dialogs/MembersListDialog";

// ... existing imports

export function MyProjectsSection({
    onProjectClick,
    onEditProject,
    onViewRequests: _onViewRequests, // Rename prop to avoid conflict if not used directly
    onViewMembers: _onViewMembers,
    onOpenChat: _onOpenChat,
}: MyProjectsSectionProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Dialog states
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [requestsOpen, setRequestsOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);

    const { data: projectsResponse, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects'),
    });

    // Extract data from paginated response
    const allProjects = projectsResponse?.data || [];
    
    // Filter projects created by the current user
    const myProjects = allProjects.filter((p: any) => p.user_id === user?.id);

    const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/projects/${projectToDelete.id}`, token || undefined);

            toast({
                title: "Loyiha o'chirildi",
                description: "Loyiha muvaffaqiyatli o'chirildi",
            });

            // Refresh projects list
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        } catch (error: any) {
            toast({
                title: "Xatolik",
                description: error.message || "Loyihani o'chirishda xatolik",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (myProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Hali loyihalaringiz yo'q
                </h3>
                <p className="text-muted-foreground text-sm">
                    Birinchi loyihangizni yarating va hamkorlar toping
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myProjects.map((project: any, index: number) => {
                    const mappedProject = {
                        ...project,
                        lookingFor: project.looking_for,
                        workType: project.work_type
                    };

                    return (
                        <div key={project.id} className="relative group">
                            <ProjectCard
                                project={mappedProject}
                                index={index}
                                onClick={() => onProjectClick?.(mappedProject)}
                            />

                            {/* Management Actions Overlay */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 glass"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditProject?.(mappedProject);
                                    }}
                                    title={t("action.edit")}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => handleDeleteClick(mappedProject, e)}
                                    title={t("action.delete")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-8 text-xs glass"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProject(mappedProject);
                                        setRequestsOpen(true);
                                    }}
                                >
                                    <UserPlus className="w-3 h-3 mr-1" />
                                    {t("action.manageRequests")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-8 text-xs glass"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProject(mappedProject);
                                        setMembersOpen(true);
                                    }}
                                >
                                    <Users className="w-3 h-3 mr-1" />
                                    {t("action.viewMembers")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 glass"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProject(mappedProject);
                                        setChatOpen(true);
                                    }}
                                    title={t("action.openChat")}
                                >
                                    <MessageCircle className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="glass border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Loyihani o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                            Haqiqatan ham "{projectToDelete?.name}" loyihasini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    O'chirilmoqda...
                                </>
                            ) : (
                                "O'chirish"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ProjectChatDialog
                projectId={selectedProject?.id}
                projectName={selectedProject?.name}
                open={chatOpen}
                onOpenChange={setChatOpen}
            />

            <RequestsListDialog
                project={selectedProject}
                open={requestsOpen}
                onOpenChange={setRequestsOpen}
            />

            <MembersListDialog
                project={selectedProject}
                open={membersOpen}
                onOpenChange={setMembersOpen}
            />
        </>
    );
}
