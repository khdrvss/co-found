import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'message' | 'join_request' | 'system';
    title: string;
    content: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    sender_avatar?: string;
    sender_name?: string;
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { toast } = useToast();
    const previousDataRef = useRef<Notification[]>([]);

    // FETCH: Poll for notifications every 5 seconds
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications?limit=20');
            return res;
        },
        refetchInterval: 5000,
        staleTime: 4000,
    });

    // COUNT: Unread count
    const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;

    // TOAST: Detect NEW notifications
    useEffect(() => {
        if (notifications.length === 0) return;

        // Find items that are in 'notifications' but NOT in 'previousDataRef'
        const latest = notifications[0];
        const prevLatest = previousDataRef.current[0];

        if (latest && prevLatest && latest.id !== prevLatest.id && !latest.is_read) {
            // use-toast API
            toast({
                title: latest.title,
                description: latest.content,
                action: (
                    <div
                        onClick={() => {
                            if (latest.link) navigate(latest.link);
                            markAsReadMutation.mutate(latest.id);
                        }}
                        className="cursor-pointer font-medium hover:underline"
                    >
                        View
                    </div>
                ) as any, // casting as specific toast action type might differ
            });
        }

        // Update ref
        previousDataRef.current = notifications;
    }, [notifications, navigate, toast]);


    // MUTATION: Mark as read
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // MUTATION: Mark ALL as read
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast({ description: "All notifications marked as read" });
        },
    });

    const handleNotificationClick = (n: Notification) => {
        if (!n.is_read) {
            markAsReadMutation.mutate(n.id);
        }
        setIsOpen(false);
        if (n.link) {
            navigate(n.link);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                            <Bell className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {notifications.map((n: Notification) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={cn(
                                        "p-3 cursor-pointer hover:bg-muted/50 transition-colors relative",
                                        !n.is_read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        {/* Dot for unread */}
                                        {!n.is_read && (
                                            <div className="absolute left-1 top-4 w-1 h-1 rounded-full bg-primary" />
                                        )}

                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-xs font-medium", !n.is_read && "text-foreground")}>
                                                {n.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                                                {n.content}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/50 pt-1">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
