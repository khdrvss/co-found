import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChatMessage, Message } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface PrivateChatDialogProps {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    overlayDisabled?: boolean; // When true, overlay will be transparent so it doesn't block underlying dialog
}

export function PrivateChatDialog({ partnerId, partnerName, partnerAvatar, open, onOpenChange, overlayDisabled = false }: PrivateChatDialogProps) {
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Redirect to auth if not logged in
    useEffect(() => {
        if (open && !isAuthenticated) {
            onOpenChange(false);
            navigate('/auth');
        }
    }, [open, isAuthenticated, onOpenChange, navigate]);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const { data: rawMessages = [], isLoading } = useQuery({
        queryKey: ['private-messages', partnerId],
        queryFn: async () => {
            try {
                if (!partnerId) return [];
                const token = localStorage.getItem('token');
                const res = await api.get(`/messages/private/${partnerId}`, token);
                return res; // may be { messages: [] } or array
            } catch (err: any) {
                console.error('Failed to load private messages', err);
                toast({ title: 'Xatolik', description: err?.message || 'Xabarlar yuklanmadi', variant: 'destructive' });
                return [];
            }
        },
        enabled: !!partnerId && open,
        refetchInterval: 3000, // Poll every 3 seconds
    });

    // Normalize response (API may return { messages: [...] } or an array)
    const messages: Message[] = Array.isArray(rawMessages)
        ? rawMessages
        : (rawMessages && typeof rawMessages === 'object' && Array.isArray((rawMessages as any).messages) ? (rawMessages as any).messages : []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            try {
                const token = localStorage.getItem('token');
                return await api.post('/messages/private', { receiverId: partnerId, message }, token);
            } catch (err: any) {
                console.error('Failed to send message', err);
                toast({ title: 'Xatolik', description: err?.message || 'Xabar yuborilmadi', variant: 'destructive' });
                throw err;
            }
        },
        onSuccess: () => {
            setNewMessage("");
            queryClient.invalidateQueries({ queryKey: ['private-messages', partnerId] });
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Guard: check authentication before sending
        if (!isAuthenticated) {
            navigate('/auth');
            onOpenChange(false);
            return;
        }
        
        if (!newMessage.trim()) return;
        sendMessageMutation.mutate(newMessage);
    };

    // If dialog is opened without a partnerId, close immediately to avoid blank overlay
    useEffect(() => {
        if (open && !partnerId) {
            toast({ title: 'Xatolik', description: 'Foydalanuvchi notogri', variant: 'destructive' });
            onOpenChange(false);
        }
    }, [open, partnerId, onOpenChange]);

    useEffect(() => {
        console.debug('PrivateChatDialog opened with', { open, partnerId, partnerName });
    }, [open, partnerId, partnerName]);

    if (!open) return null;

    if (!partnerId) {
        console.warn('PrivateChatDialog: partnerId missing, closing');
        return null;
    }

    return (
        <ErrorBoundary onError={(err) => { onOpenChange(false); toast({ title: 'Xatolik', description: err.message, variant: 'destructive' }); }}>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent noOverlay={overlayDisabled} overlayClassName={overlayDisabled ? 'bg-transparent pointer-events-none' : undefined} className="sm:max-w-[500px] h-[600px] flex flex-col p-0 glass border-border/50">
                    <DialogHeader className="p-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={partnerAvatar} />
                                <AvatarFallback>{partnerName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle>{partnerName}</DialogTitle>
                                <p className="text-xs text-muted-foreground">{isLoading ? "Connecting..." : "Online"}</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-4 bg-background/30">
                        <div className="space-y-1">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">
                                    Hali xabarlar yo'q. Suhbatni boshlang!
                                </div>
                            ) : (
                                messages.map((msg: Message) => (
                                    <ChatMessage
                                        key={msg.id || Math.random().toString()}
                                        message={msg}
                                        currentUserId={user?.id || ''}
                                        partnerAvatar={partnerAvatar}
                                        partnerName={partnerName}
                                    />
                                ))
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Xabar yozing..."
                                className="bg-secondary/50 border-0 focus-visible:ring-1"
                                disabled={sendMessageMutation.isPending}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="shrink-0 shadow-glow"
                                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </ErrorBoundary>
    );
}
