
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Ban, CheckCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function AdminUsers() {
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No token found");
            return api.get('/admin/users', token);
        }
    });

    const toggleBanMutation = useMutation({
        mutationFn: async ({ id, banned }: { id: string, banned: boolean }) => {
            const token = localStorage.getItem('token');
            return api.patch(`/admin/users/${id}/ban`, { banned }, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: "Muvaffaqiyatli", description: "Foydalanuvchi statusi o'zgardi" });
        },
        onError: (error: any) => {
            toast({ title: "Xatolik", description: error.message, variant: "destructive" });
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Foydalanuvchilar</h2>
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

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-destructive">
                <div className="w-12 h-12 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Ban className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Xatolik yuz berdi</h2>
                <p className="text-muted-foreground mt-2">{(error as Error).message}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
                >
                    Qayta urinish
                </Button>
            </div>
        );
    }

    const filteredUsers = users?.filter((u: any) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Foydalanuvchilar</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Izlash..."
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
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Foydalanuvchi</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Ro'yxatdan o'tgan</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredUsers?.map((user: any) => (
                            <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.full_name || 'Ism kiritilmagan'}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {(user.roles && user.roles.length > 0)
                                        ? user.roles.join(', ')
                                        : (user.is_admin ? "Admin" : "User")
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    {user.deleted_at ? (
                                        <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">Bloklangan</span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">Faol</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {format(new Date(user.created_at), 'dd MMM yyyy')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.is_admin && user.id === currentUser?.id ? (
                                        <span className="text-xs text-muted-foreground italic">Siz (Admin)</span>
                                    ) : user.is_admin ? (
                                        <span className="text-xs text-muted-foreground italic">Himoyalangan</span>
                                    ) : (
                                        <Button
                                            variant={user.deleted_at ? "outline" : "destructive"}
                                            size="sm"
                                            onClick={() => toggleBanMutation.mutate({ id: user.id, banned: !user.deleted_at })}
                                        >
                                            {user.deleted_at ? <CheckCircle className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
                                            {user.deleted_at ? "Tiklash" : "Bloklash"}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
