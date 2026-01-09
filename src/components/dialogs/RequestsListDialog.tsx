
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Check, X, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Project } from "@/components/cards/ProjectCard";

interface RequestsListDialogProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestsListDialog({ project, open, onOpenChange }: RequestsListDialogProps) {
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading, isError, error } = useQuery({
        queryKey: ['project-requests', project?.id],
        queryFn: async () => {
            if (!project?.id) return [];
            const token = localStorage.getItem('token');
            return api.get(`/projects/${project.id}/requests`, token);
        },
        enabled: !!project?.id && open
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) => {
            const token = localStorage.getItem('token');
            return api.put(`/projects/${project?.id}/requests/${requestId}`, { status }, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-requests', project?.id] });
            toast({ title: "Status yangilandi" });
        },
        onError: (error: any) => {
            toast({ title: "Xatolik", description: error.message, variant: "destructive" });
        }
    });

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>So'rovlar: {project.name}</DialogTitle>
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
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Hozircha so'rovlar yo'q
                        </div>
                    ) : (
                        requests.map((request: any) => (
                            <div key={request.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                            <img src={request.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${request.email}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{request.full_name || request.email}</div>
                                            <div className="text-xs text-muted-foreground">{format(new Date(request.created_at), 'dd MMM yyyy')}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                        request.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {request.status.toUpperCase()}
                                    </div>
                                </div>

                                {request.message && (
                                    <div className="bg-background/50 p-3 rounded-lg text-sm mb-3">
                                        {request.message}
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 gap-1"
                                            onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <X className="w-3 h-3" /> Rad etish
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 gap-1 bg-green-500 hover:bg-green-600 text-white"
                                            onClick={() => updateStatusMutation.mutate({ requestId: request.id, status: 'approved' })}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <Check className="w-3 h-3" /> Qabul qilish
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
