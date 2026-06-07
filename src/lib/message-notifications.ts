export function notifyMessagesRead() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("messages:read"));
  }
}
