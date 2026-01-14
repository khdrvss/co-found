import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { X, Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  partnerId: string;
  name: string;
  avatar?: string;
  message?: string;
};

const SNOOZE_KEY = 'message_notifier_snooze_until';

export function MessageNotifier() {
  const { user } = useAuth();
  const [visible, setVisible] = useState<Notif | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const lastSeenRef = useRef<string | null>(null);
  const openPartnerRef = useRef<string | null>(null);
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem(SNOOZE_KEY);
    return v ? parseInt(v, 10) : null;
  });

  // Respect prefers-reduced-motion
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const onOpen = (e: any) => {
      openPartnerRef.current = e?.detail?.partnerId || null;
    };
    const onClose = () => {
      openPartnerRef.current = null;
    };
    window.addEventListener("private-chat-open", onOpen as EventListener);
    window.addEventListener("private-chat-close", onClose);
    return () => {
      window.removeEventListener("private-chat-open", onOpen as EventListener);
      window.removeEventListener("private-chat-close", onClose);
    };
  }, []);

  const { data: convs = [] } = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: async () => {
      if (!user) return [];
      const token = localStorage.getItem("token");
      return api.get('/messages/conversations', token).catch(() => []);
    },
    refetchInterval: 3000,
    enabled: !!user,
  });

  // WebAudio beep
  const playBeep = () => {
    if (reduceMotion) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.frequency.setTargetAtTime(1320, ctx.currentTime, 0.02);
      }, 70);
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 180);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!convs || convs.length === 0) return;

    const mostRecent = convs[0];
    if (!mostRecent || !mostRecent.last_message_at) return;

    const last = lastSeenRef.current;
    const newestDate = new Date(mostRecent.last_message_at);

    // If snoozed, ignore showing visual notification
    if (snoozedUntil && Date.now() < snoozedUntil) {
      lastSeenRef.current = mostRecent.last_message_at; // update marker to avoid repeated alerts after snooze
      return;
    }

    if (!last) {
      lastSeenRef.current = mostRecent.last_message_at;
      return;
    }

    if (new Date(last) < newestDate && mostRecent.last_sender_id !== user?.id && openPartnerRef.current !== mostRecent.id) {
      const n: Notif = {
        id: String(mostRecent.id) + String(mostRecent.last_message_at),
        partnerId: mostRecent.id,
        name: mostRecent.full_name || mostRecent.email || 'Foydalanuvchi',
        avatar: mostRecent.avatar_url,
        message: mostRecent.last_message,
      };

      // Desktop Notification
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notif = new Notification(n.name, { body: n.message || "Yangi xabar", icon: n.avatar });
          notif.onclick = () => {
            window.dispatchEvent(new CustomEvent('open-private-chat', { detail: { partnerId: n.partnerId, partnerName: n.name, partnerAvatar: n.avatar } }));
            window.focus();
            notif.close();
          };
        } catch (e) {
          // ignore
        }
      } else if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      playBeep();
      setVisible(n);
      window.dispatchEvent(new CustomEvent('incoming-private-message', { detail: n }));

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setVisible(null), 6000);

      lastSeenRef.current = mostRecent.last_message_at;
    }
  }, [convs, user, snoozedUntil, reduceMotion]);

  // Also listen to real-time socket events so notifications are instant
  useEffect(() => {
    const handler = (e: any) => {
      const msg = e?.detail;
      if (!msg || !user) return;

      const senderId = String(msg.sender_id);
      const currentUserId = String(user.id);

      // Ignore messages sent by the current user
      if (senderId === currentUserId) return;

      // If snoozed or the conversation is currently open, don't show
      if (snoozedUntil && Date.now() < snoozedUntil) return;
      if (openPartnerRef.current && String(openPartnerRef.current) === senderId) return;

      const n: Notif = {
        id: String(msg.id) + String(msg.created_at),
        partnerId: senderId,
        name: msg.sender_name || 'Foydalanuvchi',
        avatar: msg.sender_avatar,
        message: msg.message,
      };

      // Desktop Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notif = new Notification(n.name, { body: n.message || 'Yangi xabar', icon: n.avatar });
          notif.onclick = () => {
            window.dispatchEvent(new CustomEvent('open-private-chat', { detail: { partnerId: n.partnerId, partnerName: n.name, partnerAvatar: n.avatar } }));
            window.focus();
            notif.close();
          };
        } catch (e) {
          // ignore
        }
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      playBeep();
      setVisible(n);
      window.dispatchEvent(new CustomEvent('incoming-private-message', { detail: n }));

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setVisible(null), 6000);
    };

    window.addEventListener('socket:message', handler as EventListener);
    return () => window.removeEventListener('socket:message', handler as EventListener);
  }, [user, snoozedUntil]);

  const openChat = (n: Notif) => {
    setVisible(null);
    window.dispatchEvent(new CustomEvent('open-private-chat', { detail: { partnerId: n.partnerId, partnerName: n.name, partnerAvatar: n.avatar } }));
    window.dispatchEvent(new CustomEvent('private-chat-open', { detail: { partnerId: n.partnerId } }));
  };

  const snooze = (mins = 60) => {
    const until = Date.now() + mins * 60 * 1000;
    localStorage.setItem(SNOOZE_KEY, String(until));
    setSnoozedUntil(until);
    setVisible(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={cn(
          "w-80 p-3 rounded-xl shadow-2xl border border-border backdrop-blur-md text-white transform transition-all duration-400 ease-out",
          reduceMotion ? "" : "animate-slide-in-right"
        )}
        role="status"
        aria-live="polite"
      >
        <div className={"absolute -top-2 left-0 right-0 h-2 rounded-t-xl overflow-hidden pointer-events-none"}>
          <div className={cn("h-full w-48 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-70", reduceMotion ? "" : "animate-shimmer")}></div>
        </div>

        <div className="flex items-start gap-3 relative">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background/30 flex items-center justify-center">
            {visible.avatar ? (
              <img src={visible.avatar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">{visible.name[0]}</div>
            )}

            {!reduceMotion && (
              <div className="absolute inset-0 rounded-lg pointer-events-none animate-pulse ring-2 ring-violet-500/20" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>{visible.name}</span>
                {!reduceMotion && <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />}
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => snooze(60)} className="text-white/80 hover:text-white text-xs px-2 py-1 rounded bg-white/5">Snooze</button>
                <button onClick={() => setVisible(null)} className="text-white/80 hover:text-white"><X className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="mt-1 text-sm leading-snug opacity-95 line-clamp-2">{visible.message}</div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => openChat(visible)} className={cn("px-3 py-1 rounded-md bg-white/10 text-white text-sm transition-transform duration-300", reduceMotion ? "" : "hover:-translate-y-0.5 hover:scale-[1.03]")}>Open</button>
              <button onClick={() => setVisible(null)} className="px-3 py-1 rounded-md bg-white/5 text-white/90 text-sm">Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageNotifier;
