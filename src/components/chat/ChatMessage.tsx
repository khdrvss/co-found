import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    created_at: string;
    sender_avatar?: string;
    sender_name?: string;
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

            {/* Outgoing Avatar - Hidden as per standard messenger style */}
        </div>
    );
}
