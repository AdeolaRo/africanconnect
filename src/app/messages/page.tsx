"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

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
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUser, setActiveUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/messages").then((r) => r.json()).then(setConversations);
    }
  }, [session]);

  useEffect(() => {
    if (withUserId && session) loadMessages(withUserId);
  }, [withUserId, session]);

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
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUser || !newMessage.trim()) return;

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

  return (
    <main className="mx-auto flex max-w-4xl gap-4 px-4 py-10">
      <aside className="w-64 shrink-0 rounded-2xl border border-peach/60 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-warm">Conversations</h2>
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
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    activeUser?.id === partner.id
                      ? "bg-peach/60 font-medium text-warm"
                      : "text-warm-muted hover:bg-cream-dark"
                  }`}
                >
                  {partner.firstName}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-peach/60 bg-white shadow-sm">
        {activeUser ? (
          <>
            <div className="border-b border-peach/40 bg-gradient-to-r from-peach/30 to-cream px-6 py-4">
              <h2 className="font-semibold text-warm">{activeUser.name}</h2>
              <p className="text-xs text-warm-muted">Échange après match mutuel — gratuit</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ minHeight: 300 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.fromUserId === session?.user?.id
                      ? "ml-auto bg-gradient-to-r from-coral to-terracotta text-white"
                      : "bg-cream-dark text-warm"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-peach/40 p-4">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                className="flex-1 rounded-xl border border-peach px-4 py-2.5 focus:border-coral focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-warm px-5 py-2.5 font-medium text-cream"
              >
                Envoyer
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-warm-muted">
            <span className="text-4xl">💬</span>
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </section>
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
