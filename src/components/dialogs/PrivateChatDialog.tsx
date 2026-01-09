
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
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PrivateChatDialogProps {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PrivateChatDialog({ partnerId, partnerName, partnerAvatar, open, onOpenChange }: PrivateChatDialogProps) {
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

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['private-messages', partnerId],
        queryFn: async () => {
            if (!partnerId) return [];
            const token = localStorage.getItem('token');
            return api.get(`/messages/private/${partnerId}`, token);
        },
        enabled: !!partnerId && open,
        refetchInterval: 3000 // Poll every 3 seconds
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            const token = localStorage.getItem('token');
            return api.post('/messages/private', { receiverId: partnerId, message }, token);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 glass border-border/50">
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
    );
}
