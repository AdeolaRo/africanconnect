"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { formatBadgeCount } from "@/components/NotificationBadge";
import { useMessageUnreadCount } from "@/hooks/useMessageUnreadCount";
import { notifyMessagesRead } from "@/lib/message-notifications";
import { Shield, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  content: string;
  fromUserId: string;
  createdAt: string;
  fromUser: { firstName: string };
}

interface Conversation {
  id: string;
  fromUser: { id: string; firstName: string };
  toUser: { id: string; firstName: string };
  unreadCount?: number;
}

interface StaffThread {
  staffId: string;
  staffName: string;
  role: string;
  lastMessage: string;
  unread: number;
}

interface StaffMessage {
  id: string;
  content: string;
  fromUserId: string;
  createdAt: string;
  fromUser: { firstName: string; role: string };
}

type Tab = "matchs" | "equipe";

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");
  const tabParam = searchParams.get("tab");

  const [tab, setTab] = useState<Tab>(tabParam === "equipe" ? "equipe" : "matchs");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [staffThreads, setStaffThreads] = useState<StaffThread[]>([]);
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);
  const [staffUnread, setStaffUnread] = useState(0);
  const [matchesUnread, setMatchesUnread] = useState(0);
  const { refresh: refreshUnreadCounts } = useMessageUnreadCount();
  const [newMessage, setNewMessage] = useState("");
  const [activeUser, setActiveUser] = useState<{ id: string; name: string } | null>(null);
  const [activeStaff, setActiveStaff] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/messages").then((r) => r.json()).then((d) => {
        if (Array.isArray(d)) {
          setConversations(d);
          setMatchesUnread(d.reduce((n, c) => n + (c.unreadCount ?? 0), 0));
        }
      });
      fetch("/api/staff-messages/inbox").then((r) => r.json()).then((d) => {
        if (d.threads) {
          setStaffThreads(d.threads);
          setStaffUnread(d.unreadTotal ?? 0);
        }
      });
      refreshUnreadCounts();
    }
  }, [session, refreshUnreadCounts]);

  useEffect(() => {
    if (withUserId && session && tab === "matchs") loadMessages(withUserId);
  }, [withUserId, session, tab]);

  function getPartner(conv: Conversation) {
    const myId = session?.user?.id;
    return conv.fromUser.id === myId ? conv.toUser : conv.fromUser;
  }

  async function loadMessages(userId: string) {
    const res = await fetch(`/api/messages?with=${userId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setMessages(data);
      const conv = conversations.find((c) => getPartner(c).id === userId);
      setActiveUser({
        id: userId,
        name: conv ? getPartner(conv).firstName : "Contact",
      });
      setActiveStaff(null);
      fetch("/api/messages").then((r) => r.json()).then((d) => {
        if (Array.isArray(d)) {
          setConversations(d);
          setMatchesUnread(d.reduce((n, c) => n + (c.unreadCount ?? 0), 0));
        }
      });
      refreshUnreadCounts();
      notifyMessagesRead();
    }
  }

  async function loadStaffMessages(staffId: string, staffName: string) {
    const res = await fetch(`/api/staff-messages/inbox?with=${staffId}`);
    const data = await res.json();
    if (data.messages) {
      setStaffMessages(data.messages);
      setActiveStaff({ id: staffId, name: staffName });
      setActiveUser(null);
      fetch("/api/staff-messages/inbox").then((r) => r.json()).then((d) => {
        if (d.threads) {
          setStaffThreads(d.threads);
          setStaffUnread(d.unreadTotal ?? 0);
        }
      });
      refreshUnreadCounts();
      notifyMessagesRead();
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (tab === "equipe" && activeStaff) {
      const res = await fetch("/api/staff-messages/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStaffId: activeStaff.id, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        loadStaffMessages(activeStaff.id, activeStaff.name);
      }
      return;
    }

    if (!activeUser) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: activeUser.id, content: newMessage }),
    });
    if (res.ok) {
      setNewMessage("");
      loadMessages(activeUser.id);
    }
  }

  const showChat = tab === "matchs" ? activeUser : activeStaff;
  const mobileChatOpen = !!showChat;

  function closeMobileChat() {
    setActiveUser(null);
    setActiveStaff(null);
    setMessages([]);
    setStaffMessages([]);
  }

  return (
    <main className="page-container max-w-4xl">
      <div className="flex flex-col gap-4 md:flex-row">
      <aside
        className={`w-full shrink-0 rounded-2xl border border-rose/15 bg-white/90 p-4 shadow-sm md:w-64 ${
          mobileChatOpen ? "hidden md:block" : "block"
        }`}
      >
        <div className="flex gap-1 rounded-full bg-cream p-1 text-xs">
          <button
            onClick={() => setTab("matchs")}
            className={`relative flex-1 rounded-full py-1.5 ${tab === "matchs" ? "bg-white font-medium text-warm shadow-sm" : "text-warm-muted"}`}
          >
            Matchs
            {matchesUnread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
                {formatBadgeCount(matchesUnread)}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("equipe")}
            className={`relative flex-1 rounded-full py-1.5 ${tab === "equipe" ? "bg-white font-medium text-warm shadow-sm" : "text-warm-muted"}`}
          >
            Équipe
            {staffUnread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
                {formatBadgeCount(staffUnread)}
              </span>
            )}
          </button>
        </div>

        {tab === "matchs" && (
          <>
            {conversations.length === 0 && (
              <p className="mt-4 text-sm text-warm-muted">Aucun match mutuel pour le moment</p>
            )}
            <ul className="mt-4 space-y-1">
              {conversations.map((conv) => {
                const partner = getPartner(conv);
                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => loadMessages(partner.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        activeUser?.id === partner.id
                          ? "bg-rose/10 font-medium text-warm"
                          : "text-warm-muted hover:bg-cream"
                      }`}
                    >
                      <span className="truncate">{partner.firstName}</span>
                      {(conv.unreadCount ?? 0) > 0 && (
                        <span className="ml-auto shrink-0 rounded-full bg-rose px-1.5 text-[10px] font-bold text-white">
                          {formatBadgeCount(conv.unreadCount ?? 0)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {tab === "equipe" && (
          <>
            {staffThreads.length === 0 && (
              <p className="mt-4 text-sm text-warm-muted">Aucun message de l&apos;équipe</p>
            )}
            <ul className="mt-4 space-y-1">
              {staffThreads.map((t) => (
                <li key={t.staffId}>
                  <button
                    onClick={() => loadStaffMessages(t.staffId, t.staffName)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      activeStaff?.id === t.staffId
                        ? "bg-plum/10 font-medium text-warm"
                        : "text-warm-muted hover:bg-cream"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-plum" />
                      {t.staffName}
                      {t.unread > 0 && (
                        <span className="ml-auto rounded-full bg-rose px-1.5 text-[10px] text-white">{t.unread}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      <section
        className={`chat-mobile-full flex-1 flex-col overflow-hidden rounded-2xl border border-rose/15 bg-white/90 shadow-sm ${
          mobileChatOpen ? "flex" : "hidden md:flex"
        }`}
      >
        {showChat ? (
          <>
            <div className={`flex items-center gap-3 border-b px-4 py-3 md:px-6 md:py-4 ${tab === "equipe" ? "bg-plum/5 border-plum/10" : "bg-rose/5 border-rose/10"}`}>
              <button
                type="button"
                onClick={closeMobileChat}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose/15 text-warm-muted hover:bg-white md:hidden"
                aria-label="Retour aux conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
              <h2 className="truncate font-semibold text-warm">
                {tab === "equipe" ? activeStaff?.name : activeUser?.name}
              </h2>
              <p className="truncate text-xs text-warm-muted">
                {tab === "equipe"
                  ? "Message de l'équipe — vous pouvez répondre"
                  : "Échange après match mutuel"}
              </p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6" style={{ minHeight: 200 }}>
              {tab === "matchs" &&
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.fromUserId === session?.user?.id
                        ? "ml-auto gradient-pulse text-white"
                        : "bg-cream text-warm"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              {tab === "equipe" &&
                staffMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.fromUserId === session?.user?.id
                        ? "ml-auto bg-warm text-cream"
                        : "border border-plum/20 bg-plum/5 text-warm"
                    }`}
                  >
                    {m.fromUserId !== session?.user?.id && (
                      <p className="mb-1 flex items-center gap-1 text-xs text-plum">
                        <Shield className="h-3 w-3" /> Équipe AfricanConnect
                      </p>
                    )}
                    {m.content}
                  </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-rose/10 p-3 md:p-4">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                className="min-w-0 flex-1 rounded-xl border border-rose/20 px-3 py-2.5 text-base focus:border-rose focus:outline-none md:px-4"
              />
              <button type="submit" className="shrink-0 rounded-full gradient-pulse px-4 py-2.5 text-sm font-medium text-white md:px-5">
                Envoyer
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-warm-muted md:p-10">
            <span className="text-4xl">💬</span>
            <p className="text-center text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  const { data: session } = useSession();

  return (
    <>
      <Header user={session?.user} />
      <Suspense fallback={<div className="p-10 text-center text-warm-muted">Chargement...</div>}>
        <MessagesContent />
      </Suspense>
    </>
  );
}
