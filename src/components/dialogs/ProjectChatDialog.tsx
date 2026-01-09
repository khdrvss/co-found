import { useState, useEffect, useRef } from "react";
import { X, Send, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ProjectChatDialogProps {
    projectId: string;
    projectName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Message {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
    full_name: string;
    avatar_url: string;
}

export function ProjectChatDialog({ projectId, projectName, open, onOpenChange }: ProjectChatDialogProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        if (!open) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = await api.get(`/projects/${projectId}/messages`, token || undefined);
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error: any) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const message = await api.post(
                `/projects/${projectId}/messages`,
                { message: newMessage },
                token || undefined
            );

            setMessages(prev => [...prev, {
                ...message,
                full_name: user?.profile?.full_name || 'You',
                avatar_url: user?.profile?.avatar_url || ''
            }]);
            setNewMessage("");
            setTimeout(scrollToBottom, 100);
        } catch (error: any) {
            toast({
                title: "Xatolik",
                description: error.message || "Xabar yuborishda xatolik",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        loadMessages();

        // Poll for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [open, projectId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border sm:max-w-2xl p-0 h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">{projectName}</h2>
                            <p className="text-xs text-muted-foreground">Guruh chati</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">Hali xabarlar yo'q</p>
                            <p className="text-sm text-muted-foreground/70">Birinchi xabarni yuboring!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.user_id === user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <img
                                        src={msg.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.full_name}`}
                                        alt={msg.full_name}
                                        className="w-8 h-8 rounded-lg flex-shrink-0"
                                    />
                                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <span className="text-xs text-muted-foreground mb-1">
                                            {msg.full_name}
                                        </span>
                                        <div
                                            className={`px-4 py-2 rounded-2xl ${isOwn
                                                ? 'bg-primary text-primary-foreground'
                                                : 'glass border border-border'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground/70 mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString('uz-UZ', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Xabar yozing..."
                            className="flex-1 glass"
                            disabled={sending}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="px-4"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
