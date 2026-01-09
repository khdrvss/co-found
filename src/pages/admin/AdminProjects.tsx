
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Star, Trash2, Search, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function AdminProjects() {
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['admin-projects'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            return api.get('/admin/projects', token);
        }
    });

    const recommendMutation = useMutation({
        mutationFn: async ({ id, recommended }: { id: string, recommended: boolean }) => {
            const token = localStorage.getItem('token');
            return api.patch(`/admin/projects/${id}/recommend`, { recommended }, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
            toast({ title: "Muvaffaqiyatli", description: "Loyiha tavsiyasi yangilandi" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('token');
            return api.delete(`/admin/projects/${id}`, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
            toast({ title: "O'chirildi", description: "Loyiha muvaffaqiyatli o'chirildi" });
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Loyihalar</h2>
                    <div className="w-72 h-10 bg-secondary/50 rounded-md animate-pulse" />
                </div>
                <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-12 w-full bg-secondary/30 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const filteredProjects = projects?.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Loyihalar</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Loyiha nomi, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-secondary/50"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Loyiha</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Egasi</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Kategoriya</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Yaratilgan</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredProjects?.map((project: any) => (
                            <tr key={project.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium flex items-center gap-2">
                                            {project.name}
                                            {project.recommended && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{project.description}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{project.owner_email}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline">{project.category}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {format(new Date(project.created_at), 'dd MMM yyyy')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => recommendMutation.mutate({ id: project.id, recommended: !project.recommended })}
                                            title="Tavsiya qilish"
                                        >
                                            <Star className={`w-4 h-4 ${project.recommended ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => {
                                                if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
                                                    deleteMutation.mutate(project.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
