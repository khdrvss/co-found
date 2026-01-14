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
    const [partnerTyping, setPartnerTyping] = useState(false);
    const typingTimeoutRef = useRef<number | null>(null);
    const lastTypingEmitRef = useRef<number>(0);
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
                // res is an array of messages
                return res;
            } catch (err: any) {
                console.error('Failed to load private messages', err);
                toast({ title: 'Xatolik', description: err?.message || 'Xabarlar yuklanmadi', variant: 'destructive' });
                return [];
            }
        },
        enabled: !!partnerId && open,
        refetchInterval: 3000, // Poll every 3 seconds
    });

    // rawMessages should already be an array
    const messages: Message[] = Array.isArray(rawMessages) ? rawMessages : [];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.post('/messages/private', { receiverId: partnerId, message }, token);
                return res as any; // enriched message
            } catch (err: any) {
                console.error('Failed to send message', err);
                toast({ title: 'Xatolik', description: err?.message || 'Xabar yuborilmadi', variant: 'destructive' });
                throw err;
            }
        },
        onSuccess: (newMsg: any) => {
            setNewMessage("");
            // Update cache manually to append newly sent message at the end
            queryClient.setQueryData(['private-messages', partnerId], (old: any) => {
                const arr = Array.isArray(old) ? old : (old?.messages || []);
                return [...arr, newMsg];
            });
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

    // Throttled typing emission
    const handleTyping = () => {
        const now = Date.now();
        if (now - lastTypingEmitRef.current > 2500) {
            lastTypingEmitRef.current = now;
            window.dispatchEvent(new CustomEvent('socket:emit-typing', { detail: { to: partnerId } }));
        }
    };

    useEffect(() => {
        const handler = (e: any) => {
            const from = String(e?.detail?.from || '');
            if (String(partnerId) !== from) return;
            setPartnerTyping(true);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => setPartnerTyping(false), 2500);
        };

        window.addEventListener('socket:typing', handler as EventListener);
        return () => {
            window.removeEventListener('socket:typing', handler as EventListener);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
        };
    }, [partnerId]);

    useEffect(() => {
        // when dialog opens, mark all from partner as read
        if (open && partnerId) {
            const token = localStorage.getItem('token');
            fetch(`/api/messages/private/${partnerId}/read`, { method: 'PUT', headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
                .then(async (res) => {
                    if (!res.ok) return;
                    const data = await res.json();
                    const readUpTo = data?.read_up_to;

                    if (readUpTo) {
                        // mark local cache messages (from partner) as read up to readUpTo
                        queryClient.setQueryData(['private-messages', partnerId], (old: any) => {
                            if (!Array.isArray(old)) return old;
                            const cutoff = new Date(readUpTo).getTime();
                            return old.map((m: any) => {
                                if (String(m.sender_id) === String(partnerId) && new Date(m.created_at).getTime() <= cutoff) {
                                    return { ...m, read: true, read_at: readUpTo };
                                }
                                return m;
                            });
                        });

                        queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    } else {
                        queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    }
                })
                .catch(() => { });
        }
    }, [open, partnerId]);

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
                                <p className="text-xs text-muted-foreground">{partnerTyping ? '... yozmoqda' : (isLoading ? 'Connecting...' : 'Online')}</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-4 bg-background/30" aria-live="polite" aria-atomic="false">
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

                            {/* Typing indicator */}
                            {partnerTyping && (
                                <div className="flex items-start gap-2 mt-2">
                                    <div className="bg-[#3E4042] rounded-lg py-2 px-3">
                                        <div className="flex gap-2 items-center">
                                            <span className={"w-2 h-2 rounded-full bg-white"} style={{ animationDelay: '0ms' }} />
                                            <span className={"w-2 h-2 rounded-full bg-white"} style={{ animationDelay: '120ms' }} />
                                            <span className={"w-2 h-2 rounded-full bg-white"} style={{ animationDelay: '240ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                        <form onSubmit={handleSend} className="flex gap-2" aria-label="Send message form">
                            <Input
                                value={newMessage}
                                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                                placeholder="Xabar yozing..."
                                aria-label="Write a message"
                                className="bg-secondary/50 border-0 focus-visible:ring-1"
                                disabled={sendMessageMutation.isPending}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="shrink-0 shadow-glow"
                                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                                aria-label="Send message"
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
