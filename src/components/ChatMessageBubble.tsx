"use client";

import { useState } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { canEditMessage, DELETED_MESSAGE_LABEL } from "@/lib/message-utils";

export interface ChatMessageItem {
  id: string;
  content: string;
  deleted?: boolean;
  edited?: boolean;
  createdAt: string;
  fromUserId: string;
  fromUser?: { firstName?: string; role?: string };
}

interface ChatMessageBubbleProps {
  message: ChatMessageItem;
  isMe: boolean;
  myUserId?: string;
  apiBase: "/api/messages" | "/api/staff-messages";
  variant?: "match" | "staff" | "equipe";
  onUpdated: () => void;
  headerExtra?: React.ReactNode;
}

export default function ChatMessageBubble({
  message: m,
  isMe,
  myUserId,
  apiBase,
  variant = "match",
  onUpdated,
  headerExtra,
}: ChatMessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(m.content);
  const [busy, setBusy] = useState(false);

  const deleted = m.deleted || m.content === DELETED_MESSAGE_LABEL;
  const editable = isMe && !deleted && canEditMessage(m.createdAt);

  async function saveEdit() {
    if (!editText.trim()) return;
    setBusy(true);
    const res = await fetch(`${apiBase}/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      onUpdated();
    }
  }

  async function deleteMsg() {
    if (!confirm("Supprimer ce message ?")) return;
    setBusy(true);
    const res = await fetch(`${apiBase}/${m.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onUpdated();
  }

  const bubbleClass =
    variant === "equipe"
      ? isMe
        ? "ml-auto bg-warm text-cream"
        : "border border-plum/20 bg-plum/5 text-warm"
      : variant === "staff"
        ? isMe
          ? "bg-gradient-to-r from-plum to-rose text-white"
          : "border border-rose/10 bg-white text-warm"
        : isMe
          ? "ml-auto gradient-pulse text-white"
          : "bg-cream text-warm";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${bubbleClass} ${deleted ? "italic opacity-70" : ""}`}>
        {!isMe && m.fromUser?.firstName && (
          <p className="mb-1 text-xs font-medium opacity-80">{headerExtra ?? m.fromUser.firstName}</p>
        )}

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full min-w-[12rem] rounded-lg border border-rose/20 px-2 py-1 text-sm text-warm focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={saveEdit} className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs">
                <Check className="h-3 w-3" /> Enregistrer
              </button>
              <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs opacity-80">
                <X className="h-3 w-3" /> Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{m.content}</p>
        )}

        <div className={`mt-1 flex items-center gap-2 text-[10px] ${isMe && variant !== "equipe" ? "text-white/70" : "text-warm-muted"}`}>
          <span>
            {new Date(m.createdAt).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {m.edited && !deleted && <span>· modifié</span>}
        </div>

        {isMe && !deleted && !editing && myUserId && (
          <div className="absolute -top-2 right-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            {editable && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditText(m.content);
                  setEditing(true);
                }}
                className="rounded-full bg-white p-1 text-warm shadow ring-1 ring-rose/10 hover:text-rose"
                aria-label="Modifier"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={deleteMsg}
              className="rounded-full bg-white p-1 text-warm shadow ring-1 ring-rose/10 hover:text-red-600"
              aria-label="Supprimer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
