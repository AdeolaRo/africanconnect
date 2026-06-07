"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Calendar, Shield } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";

export interface ModThread {
  threadKey: string;
  type: "match" | "staff";
  userA: { id: string; firstName: string; email: string; role: string };
  userB: { id: string; firstName: string; email: string; role: string };
  messageCount: number;
  lastMessage: string;
  lastAt: string;
}

interface ThreadMessage {
  id: string;
  type: "match" | "staff";
  content: string;
  rawContent?: string;
  deleted: boolean;
  edited: boolean;
  createdAt: string;
  fromUserId: string;
  from: { firstName: string };
  to: { firstName: string };
}

interface ModerationThreadPanelProps {
  thread: ModThread | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function ModerationThreadPanel({ thread, onClose, onDeleted }: ModerationThreadPanelProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!thread) {
      setMessages([]);
      return;
    }

    const current = thread;

    async function load() {
      setLoading(true);
      const { data } = await fetchJson<{ messages: ThreadMessage[] }>(
        `/api/moderation/content/messages?type=${current.type}&userA=${current.userA.id}&userB=${current.userB.id}`
      );
      if (data) setMessages(data.messages);
      setLoading(false);
    }

    load();
  }, [thread]);

  async function deleteMessage(id: string, type: "match" | "staff") {
    if (!confirm("Supprimer ce message définitivement ?")) return;
    await fetchJson(`/api/moderation/content/messages/${id}?type=${type}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    onDeleted();
  }

  if (!thread) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-warm/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-rose/15 bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-rose/10 bg-cream/50 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  thread.type === "staff" ? "bg-plum/10 text-plum" : "bg-rose/10 text-rose"
                }`}
              >
                {thread.type === "staff" ? "Équipe" : "Match"}
              </span>
              <span className="text-xs text-warm-muted">{thread.messageCount} message{thread.messageCount > 1 ? "s" : ""}</span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-warm">
              {thread.userA.firstName} ↔ {thread.userB.firstName}
            </h3>
            <p className="text-xs text-warm-muted">{thread.userA.email} · {thread.userB.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-warm-muted hover:bg-white" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-sm text-warm-muted">Chargement…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-warm-muted">Conversation vide</p>
          ) : (
            messages.map((m) => (
              <article
                key={m.id}
                className={`rounded-2xl border p-4 ${m.deleted ? "border-warm/10 bg-cream/40 opacity-80" : "border-rose/10 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-warm">
                      {m.from.firstName} → {m.to.firstName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-warm-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(m.createdAt).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {m.edited && " · modifié"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMessage(m.id, m.type)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
                <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed ${m.deleted ? "italic text-warm-muted" : "text-warm"}`}>
                  {m.deleted ? (
                    <>
                      <span className="text-warm-muted">Message supprimé par l&apos;auteur</span>
                      {m.rawContent && (
                        <span className="mt-1 block text-xs not-italic text-warm-muted/80">Original : « {m.rawContent} »</span>
                      )}
                    </>
                  ) : (
                    <>« {m.content} »</>
                  )}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ModerationThreadRow({
  thread,
  onOpen,
}: {
  thread: ModThread;
  onOpen: (t: ModThread) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(thread)}
      className="flex w-full items-start gap-3 rounded-2xl border border-rose/10 bg-white p-4 text-left transition-colors hover:bg-rose/5 md:border-0 md:border-b md:border-rose/8 md:rounded-none md:px-6 md:py-5"
    >
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
          thread.type === "staff" ? "bg-plum/10 text-plum ring-plum/20" : "bg-rose/10 text-rose ring-rose/20"
        }`}
      >
        {thread.type === "staff" ? "Équipe" : "Match"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-warm">
          {thread.userA.firstName} ↔ {thread.userB.firstName}
        </p>
        <p className="mt-0.5 truncate text-sm text-warm-muted">{thread.lastMessage}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-warm-muted">
          <span>{thread.messageCount} msg.</span>
          <span>·</span>
          <span>
            {new Date(thread.lastAt).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </p>
      </div>
      <Shield className="hidden h-4 w-4 shrink-0 text-rose/40 sm:block" />
    </button>
  );
}
