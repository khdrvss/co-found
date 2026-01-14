import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

/**
 * SocketManager: Connects to the server-side Socket.IO and applies incoming
 * events to React Query caches so the UI updates in real-time.
 */
export default function SocketManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');

    const socket = io(apiUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.debug('Socket connected', socket.id);
    });

    socket.on('message.created', (msg: any) => {
      try {
        const currentUserId = user.id?.toString();
        const senderId = (msg.sender_id || '').toString();
        const receiverId = (msg.receiver_id || '').toString();
        const partnerId = senderId === currentUserId ? receiverId : senderId;

        // Update private messages cache for the conversation
        queryClient.setQueryData(['private-messages', partnerId], (old: any) => {
          if (!old) return [msg];
          if (old.some((m: any) => String(m.id) === String(msg.id))) return old; // dedupe
          return [...old, msg];
        });

        // If this message was for the current user, acknowledge delivery
        if (receiverId === currentUserId) {
          try {
            socketRef.current?.emit('message.delivered', { messageId: msg.id });
          } catch (e) {
            // ignore
          }
        }

        // Update conversations list (move to top and update unread count)
        queryClient.setQueryData(['conversations'], (old: any) => {
          const existing = Array.isArray(old) ? old : [];
          const idx = existing.findIndex((c: any) => String(c.id) === String(partnerId));

          const updatedEntry = {
            id: partnerId,
            full_name: msg.sender_name || '',
            avatar_url: msg.sender_avatar || '',
            last_message: msg.message,
            last_message_at: msg.created_at,
            last_sender_id: msg.sender_id,
            unread_count: msg.receiver_id?.toString() === currentUserId ? ((existing[idx]?.unread_count || 0) + 1) : (existing[idx]?.unread_count || 0),
          } as any;

          if (idx === -1) {
            return [updatedEntry, ...existing];
          }

          const newArr = [...existing];
          newArr[idx] = { ...newArr[idx], ...updatedEntry };
          // Move to front
          return [newArr[idx], ...newArr.filter((_, i) => i !== idx)];
        });

        // Let any UI components know a message arrived (e.g., notifier)
        window.dispatchEvent(new CustomEvent('socket:message', { detail: msg }));
      } catch (err) {
        console.error('Failed handling incoming socket message', err);
      }
    });

    socket.on('message.delivered', (payload: any) => {
      try {
        // Update message metadata in all private messages caches (mark as delivered)
        const msgId = String(payload.id);
        const queries = queryClient.getQueriesData({ queryKey: ['private-messages'] });
        for (const [qKey, data] of queries) {
          if (!Array.isArray(data)) continue;
          const changed = data.map((m: any) => (String(m.id) === msgId ? { ...m, delivered: true, delivered_at: payload.delivered_at } : m));
          queryClient.setQueryData(qKey as any, changed);
        }
      } catch (err) {
        console.error('Failed handling message.delivered socket event', err);
      }
    });

    socket.on('messages.read', (payload: any) => {
      try {
        const by = String(payload.by || '');
        const readUpTo = payload.read_up_to;

        // Update per-message state in private-messages caches for the sender (current user)
        if (readUpTo && user?.id) {
          const myId = String(user.id);
          // The recipient (who read the messages) is 'by'. We need to mark messages where current user is the sender and receiver == by
          const key = ['private-messages', by];
          queryClient.setQueryData(key, (old: any) => {
            if (!Array.isArray(old)) return old;
            const cutoff = new Date(readUpTo).getTime();
            return old.map((m: any) => {
              if (String(m.sender_id) === myId && new Date(m.created_at).getTime() <= cutoff) {
                return { ...m, read: true, read_at: readUpTo };
              }
              return m;
            });
          });
        }

        // Update conversations unread count and dispatch event
        queryClient.setQueryData(['conversations'], (old: any) => {
          if (!Array.isArray(old)) return old;
          const idx = old.findIndex((c: any) => String(c.id) === by);
          if (idx === -1) return old;
          const newArr = [...old];
          newArr[idx] = { ...newArr[idx], unread_count: 0 };
          return newArr;
        });

        window.dispatchEvent(new CustomEvent('socket:messages.read', { detail: payload }));
      } catch (err) {
        console.error('Failed handling messages.read socket event', err);
      }
    });

    socket.on('typing', (payload: any) => {
      try {
        // Forward typing events to UI components
        window.dispatchEvent(new CustomEvent('socket:typing', { detail: payload }));
      } catch (err) {
        // ignore
      }
    });

    const emitTypingHandler = (e: any) => {
      try {
        const detail = e?.detail;
        if (!detail) return;
        socketRef.current?.emit('typing', detail);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('socket:emit-typing', emitTypingHandler);

    return () => {
      try {
        window.removeEventListener('socket:emit-typing', emitTypingHandler);
        socket.disconnect();
      } catch (e) {
        // ignore
      }
    };
  }, [user?.id]);

  return null;
}
