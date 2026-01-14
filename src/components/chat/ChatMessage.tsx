import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, CheckSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    created_at: string;
    sender_avatar?: string;
    sender_name?: string;
    // New: delivery/read receipts
    delivered?: boolean;
    delivered_at?: string | null;
    read?: boolean;
    read_at?: string | null;
}

interface ChatMessageProps {
    message: Message;
    currentUserId: string;
    partnerAvatar?: string;
    partnerName?: string;
}

export function ChatMessage({ message, currentUserId, partnerAvatar, partnerName }: ChatMessageProps) {
    // STRICT SENDER DETECTION
    // currentUserId must be valid. If it's missing, we default to false (incoming) which is safe fallback but visibly wrong if it's me.
    if (!currentUserId) {
        console.warn("ChatMessage: currentUserId is missing!", message);
    }

    const senderIdString = String(message.sender_id).trim();
    const currentUserIdString = String(currentUserId).trim();
    const isMine = senderIdString === currentUserIdString;

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const [flash, setFlash] = useState(false);
    const flashTimerRef = useRef<number | null>(null);
    const prevReadRef = useRef<boolean | undefined>(message.read);

    useEffect(() => {
        if (message.read && !prevReadRef.current) {
            setFlash(true);
            if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
            flashTimerRef.current = window.setTimeout(() => setFlash(false), 700);
        }
        prevReadRef.current = message.read;
        return () => {
            if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
        };
    }, [message.read]);

    return (
        <div className={cn(
            "flex w-full items-end gap-2 mb-2",
            isMine ? "justify-end" : "justify-start"
        )}>
            {/* Incoming Avatar (Left) */}
            {!isMine && (
                <Avatar className="w-8 h-8 rounded-full border border-border/10 shrink-0">
                    <AvatarImage src={partnerAvatar || message.sender_avatar} />
                    <AvatarFallback className="text-[10px] bg-zinc-700 text-zinc-300">
                        {(partnerName || message.sender_name || '?')[0]}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Message Bubble */}
            <div className={cn(
                "max-w-[70%] px-4 py-2 relative text-sm shadow-md",
                isMine
                    ? "bg-[#8B5CF6] text-white rounded-[20px] rounded-br-none"
                    : "bg-[#3E4042] text-white rounded-[20px] rounded-bl-none"
            )}>
                <p className="leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
            </div>

            {/* Delivery / Read indicator for outgoing messages */}
            {isMine && (
                <div className="w-[80px] text-[11px] text-muted-foreground text-right flex items-center justify-end gap-1">
                    {message.read ? (
                        <div className={cn("flex items-center gap-1", reduceMotion ? '' : 'transition-transform duration-200')}> 
                            <CheckSquare className={cn("w-4 h-4 text-sky-400", !reduceMotion && flash ? 'scale-110' : '')} />
                            <span className="text-xs">{message.read_at ? format(new Date(message.read_at), 'HH:mm') : 'Seen'}</span>
                        </div>
                    ) : message.delivered ? (
                        <div className={cn("flex items-center gap-1", reduceMotion ? '' : 'opacity-80')}> 
                            <Check className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs">{message.delivered_at ? format(new Date(message.delivered_at), 'HH:mm') : 'Delivered'}</span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
