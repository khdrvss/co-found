
import { MessageCircle, Users, Clock, User } from "lucide-react";
import { EmptyStateAnimated } from "@/components/ui/empty-state-animated";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { ProjectChatDialog } from "@/components/dialogs/ProjectChatDialog";
import { PrivateChatDialog } from "@/components/dialogs/PrivateChatDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";

interface MessagesSectionProps {
    onProjectClick?: (project: any) => void;
}



export function MessagesSection({ onProjectClick }: MessagesSectionProps) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [selectedPrivateChat, setSelectedPrivateChat] = useState<any>(null);

    // Get user's projects
    const { data: projects = [], isLoading: loadingProjects } = useQuery({
        queryKey: ['user-projects'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const allProjects = await api.get('/projects', token || undefined);
            const myProjects = allProjects.filter((p: any) => p.user_id === user?.id);
            const memberProjects = await api.get(`/projects/${user?.id}/member-projects`, token)
                .catch(() => []); // Fallback if endpoint doesn't exist yet

            // Deduplicate logic if needed, but for now just my projects
            return myProjects;
        },
        enabled: !!user
    });

    // Get private conversations
    const { data: conversations = [], isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            return api.get('/messages/conversations', token);
        },
        enabled: !!user
    });

    if (loadingProjects || loadingConversations) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-muted-foreground">Yuklanmoqda...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SEO title="Messages" noIndex={true} description="Your private messages" />
            <Tabs defaultValue="groups" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="groups">Guruhlar</TabsTrigger>
                    <TabsTrigger value="private">Shaxsiy</TabsTrigger>
                </TabsList>

                <TabsContent value="groups" className="animate-fade-in-up mt-6">
                    {projects.length === 0 ? (
                        <EmptyStateAnimated
                            type="projects"
                            title="Guruhlar mavjud emas"
                            description="Loyihalarga qo'shiling yoki o'z loyihangizni yarating"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project: any) => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedChat(project)}
                                    className="glass rounded-2xl p-5 text-left hover:bg-secondary/50 transition-all duration-300 gradient-border group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground mb-1 truncate">{project.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>Guruh chati</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="private" className="animate-fade-in-up mt-6">
                    {conversations.length === 0 ? (
                        <EmptyStateAnimated
                            type="messages"
                            title="Xabarlar yo'q"
                            description="Foydalanuvchilar bilan suhbatni boshlang"
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {conversations.map((conv: any) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedPrivateChat(conv)}
                                    className="glass rounded-xl p-4 text-left hover:bg-secondary/50 transition-all duration-300 group flex items-center gap-4"
                                >
                                    <div className="relative">
                                        <img
                                            src={conv.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${conv.email}`}
                                            alt={conv.full_name}
                                            className="w-12 h-12 rounded-full object-cover bg-secondary"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-foreground truncate">{conv.full_name || conv.email}</h3>
                                            {conv.last_message_at && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(conv.last_message_at), 'dd MMM HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                                            {conv.last_message}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            {selectedChat && (
                <ProjectChatDialog
                    projectId={selectedChat.id}
                    projectName={selectedChat.name}
                    open={!!selectedChat}
                    onOpenChange={(open) => !open && setSelectedChat(null)}
                />
            )}

            {selectedPrivateChat && (
                <PrivateChatDialog
                    partnerId={selectedPrivateChat.id}
                    partnerName={selectedPrivateChat.full_name || selectedPrivateChat.email}
                    partnerAvatar={selectedPrivateChat.avatar_url}
                    open={!!selectedPrivateChat}
                    onOpenChange={(open) => !open && setSelectedPrivateChat(null)}
                />
            )}
        </div>
    );
}
