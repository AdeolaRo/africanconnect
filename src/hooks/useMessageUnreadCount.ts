"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchJson } from "@/lib/fetch-json";

export interface MessageUnreadCounts {
  total: number;
  matches: number;
  staff: number;
}

const POLL_MS = 30_000;

export function useMessageUnreadCount() {
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState<MessageUnreadCounts>({ total: 0, matches: 0, staff: 0 });

  const refresh = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setCounts({ total: 0, matches: 0, staff: 0 });
      return;
    }

    const { data } = await fetchJson<MessageUnreadCounts>("/api/messages/unread-count");
    if (data) setCounts(data);
  }, [session?.user?.id, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onMessagesRead = () => refresh();

    window.addEventListener("focus", onFocus);
    window.addEventListener("messages:read", onMessagesRead);
    document.addEventListener("visibilitychange", onVisible);

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("messages:read", onMessagesRead);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [refresh, status]);

  return { counts, refresh };
}
