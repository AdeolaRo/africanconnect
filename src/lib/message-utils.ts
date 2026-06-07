export const MESSAGE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export const DELETED_MESSAGE_LABEL = "Message supprimé";

export function canEditMessage(createdAt: Date | string, deletedAt?: Date | string | null): boolean {
  if (deletedAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age <= MESSAGE_EDIT_WINDOW_MS;
}

export function getPublicMessageContent(
  content: string,
  deletedAt?: Date | string | null
): string {
  if (deletedAt) return DELETED_MESSAGE_LABEL;
  return content;
}

export function threadPairKey(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join(":");
}

export interface SerializedMessage {
  id: string;
  content: string;
  rawContent?: string;
  deleted: boolean;
  edited: boolean;
  editedAt?: string | null;
  createdAt: string;
  fromUserId: string;
}

export function serializeMessageForClient(
  m: {
    id: string;
    content: string;
    originalContent?: string | null;
    deletedAt?: Date | null;
    editedAt?: Date | null;
    createdAt: Date;
    fromUserId: string;
  },
  options?: { moderatorView?: boolean }
): SerializedMessage {
  const deleted = !!m.deletedAt;
  const moderatorView = options?.moderatorView ?? false;

  return {
    id: m.id,
    content: moderatorView
      ? m.content
      : getPublicMessageContent(m.content, m.deletedAt),
    rawContent: moderatorView && deleted ? m.content : undefined,
    deleted,
    edited: !!m.editedAt,
    editedAt: m.editedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
    fromUserId: m.fromUserId,
  };
}
