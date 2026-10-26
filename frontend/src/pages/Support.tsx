
import { useCallback, useEffect, useState } from "react";
import {
  createSupportConversation,
  getAllSupportConversations,
  getMySupportConversations,
  markSupportConversationAsRead,
  sendSupportMessage,
  updateSupportStatus,
  type SupportConversation,
  type SupportStatus,
} from "@/features/support/supportAPI";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Ticket,
} from "lucide-react";

const SUPPORT_READ_EVENT = "support-read-updated";
const SUPPORT_REFRESH_INTERVAL = 15000;

function normalizeRole(role?: string): string {
  return (role ?? "").replace(/^ROLE_/, "").toUpperCase();
}

function readUserRole(): string {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return "";

    const user = JSON.parse(storedUser) as { role?: string };
    return normalizeRole(user.role);
  } catch {
    return "";
  }
}

function formatDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: SupportStatus): string {
  switch (status) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
  }
}

const statusClasses: Record<SupportStatus, string> = {
  OPEN: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  IN_PROGRESS: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  RESOLVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

export default function Support() {
  const isAdmin = readUserRole() === "ADMIN";

  const [conversations, setConversations] = useState<
    SupportConversation[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [reply, setReply] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;

  const applyUpdatedConversation = useCallback(
    (updated: SupportConversation) => {
      setConversations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
    [],
  );

  const markConversationRead = useCallback(
    async (conversationId: number) => {
      try {
        const updated =
          await markSupportConversationAsRead(conversationId);

        applyUpdatedConversation(updated);

        window.dispatchEvent(new Event(SUPPORT_READ_EVENT));
      } catch (readError) {
        // Keep the conversation usable if marking it read fails.
        console.error(
          "Unable to mark support conversation as read:",
          readError,
        );
      }
    },
    [applyUpdatedConversation],
  );

  const loadConversations = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
        setError("");
      }

      try {
        const result = isAdmin
          ? await getAllSupportConversations()
          : await getMySupportConversations();

        setConversations(result);

        const nextSelectedId =
          selectedId !== null &&
          result.some((item) => item.id === selectedId)
            ? selectedId
            : (result[0]?.id ?? null);

        setSelectedId(nextSelectedId);

        // If a conversation is currently selected, mark its incoming
        // messages as read when refreshing this open Support page.
        if (nextSelectedId !== null) {
          try {
            const updated =
              await markSupportConversationAsRead(nextSelectedId);

            setConversations((current) => {
              const exists = current.some(
                (item) => item.id === updated.id,
              );

              if (!exists) return current;

              return current.map((item) =>
                item.id === updated.id ? updated : item,
              );
            });

            window.dispatchEvent(new Event(SUPPORT_READ_EVENT));
          } catch (readError) {
            console.error(
              "Unable to mark selected support conversation as read:",
              readError,
            );
          }
        }
      } catch {
        if (showLoader) {
          setError(
            "Support conversations load nahi hui. Login aur backend check karo.",
          );
        } else {
          console.error("Unable to refresh support conversations.");
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [isAdmin, selectedId],
  );

  useEffect(() => {
    void loadConversations(true);

    const intervalId = window.setInterval(() => {
      void loadConversations(false);
    }, SUPPORT_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadConversations]);

  async function handleCreateConversation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!subject.trim() || !initialMessage.trim()) {
      setError("Subject aur message dono fill karo.");
      return;
    }

    setSaving(true);

    try {
      const created = await createSupportConversation({
        subject: subject.trim(),
        message: initialMessage.trim(),
      });

      setConversations((current) => [
        created,
        ...current.filter((item) => item.id !== created.id),
      ]);

      setSelectedId(created.id);
      setSubject("");
      setInitialMessage("");
      setShowNewConversation(false);
      setNotice("Support conversation create ho gayi.");

      window.dispatchEvent(new Event(SUPPORT_READ_EVENT));
    } catch {
      setError("Conversation create nahi hui. Please dobara try karo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendMessage(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedConversation || !reply.trim()) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await sendSupportMessage(
        selectedConversation.id,
        reply.trim(),
      );

      setConversations((current) => [
        updated,
        ...current.filter((item) => item.id !== updated.id),
      ]);

      setSelectedId(updated.id);
      setReply("");
      setNotice("Message send ho gaya.");

      window.dispatchEvent(new Event(SUPPORT_READ_EVENT));
    } catch {
      setError(
        "Message send nahi hua. Conversation resolved ho sakti hai ya session expire ho gaya hai.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: SupportStatus) {
    if (!selectedConversation) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await updateSupportStatus(
        selectedConversation.id,
        status,
      );

      applyUpdatedConversation(updated);
      setNotice("Conversation status update ho gaya.");
    } catch {
      setError("Status update nahi hua. Admin access check karo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectConversation(conversationId: number) {
    setSelectedId(conversationId);
    setError("");
    setNotice("");

    // Update the badge immediately after the backend confirms read status.
    await markConversationRead(conversationId);
  }

  return (
    <div className="min-h-screen bg-[#0a0f19] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
              {isAdmin ? (
                <ShieldCheck size={16} />
              ) : (
                <Headphones size={16} />
              )}
              {isAdmin ? "Support Administration" : "Customer Care"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {isAdmin ? "Support Inbox" : "How can we help?"}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {isAdmin
                ? "Customer questions aur conversations manage karo."
                : "Apna issue share karo aur yahin support team ke replies pao."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadConversations(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setShowNewConversation((current) => !current);
                  setError("");
                  setNotice("");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                <MessageCircle size={17} />
                New Conversation
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </div>
        )}

        {showNewConversation && !isAdmin && (
          <form
            onSubmit={handleCreateConversation}
            className="mb-6 rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6"
          >
            <h2 className="mb-5 text-lg font-semibold">
              Start a conversation
            </h2>

            <label className="mb-2 block text-sm text-slate-300">
              Subject
            </label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Order delivery issue"
              className="mb-4 w-full rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Describe your issue
            </label>
            <textarea
              value={initialMessage}
              onChange={(event) => setInitialMessage(event.target.value)}
              maxLength={3000}
              required
              rows={4}
              placeholder="Tell us how we can help..."
              className="mb-4 w-full resize-y rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {saving && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                Create Conversation
              </button>

              <button
                type="button"
                onClick={() => setShowNewConversation(false)}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid min-h-[560px] gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold">Conversations</h2>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-400">
                {conversations.length}
              </span>
            </div>

            <div className="max-h-[650px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Ticket size={32} className="mx-auto mb-3 text-slate-600" />
                  <p className="font-medium text-slate-300">
                    No conversations yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {isAdmin
                      ? "Customer conversations yahan appear hongi."
                      : "New Conversation par click karke help maango."}
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() =>
                      void handleSelectConversation(conversation.id)
                    }
                    className={`block w-full border-b border-white/[0.06] p-4 text-left transition ${
                      selectedId === conversation.id
                        ? "bg-blue-500/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold text-slate-100">
                        {conversation.subject}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          #{conversation.id}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <p className="mb-2 truncate text-xs text-slate-400">
                        {conversation.customerName} ·{" "}
                        {conversation.customerEmail}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] ${statusClasses[conversation.status]}`}
                      >
                        {statusLabel(conversation.status)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(conversation.updatedAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <Headphones size={32} className="text-blue-300" />
                </div>
                <h2 className="text-lg font-semibold">
                  Select a conversation
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Conversation select karo ya nayi conversation start karo.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mb-1 text-xs text-slate-500">
                      Conversation #{selectedConversation.id}
                    </p>
                    <h2 className="text-lg font-semibold">
                      {selectedConversation.subject}
                    </h2>
                    {isAdmin && (
                      <p className="mt-1 text-sm text-slate-400">
                        {selectedConversation.customerName} ·{" "}
                        {selectedConversation.customerEmail}
                      </p>
                    )}
                  </div>

                  {isAdmin ? (
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      Status
                      <select
                        value={selectedConversation.status}
                        disabled={saving}
                        onChange={(event) =>
                          void handleStatusChange(
                            event.target.value as SupportStatus,
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#0a0f19] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </label>
                  ) : (
                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs ${statusClasses[selectedConversation.status]}`}
                    >
                      {statusLabel(selectedConversation.status)}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                  {selectedConversation.messages.map((message) => {
                    const isAdminMessage =
                      normalizeRole(message.senderRole) === "ADMIN";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isAdminMessage ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl border p-4 sm:max-w-[78%] ${
                            isAdminMessage
                              ? "border-white/10 bg-[#0a0f19]"
                              : "border-blue-500/20 bg-blue-600/10"
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {message.senderName}
                            </span>
                            {isAdminMessage && (
                              <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] text-blue-300">
                                Support Team
                              </span>
                            )}
                          </div>

                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                            {message.message}
                          </p>

                          <p className="mt-3 text-right text-[10px] text-slate-500">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedConversation.status === "RESOLVED" ? (
                  <div className="border-t border-white/10 p-5 text-center text-sm text-emerald-300">
                    <CheckCircle2 size={18} className="mr-2 inline" />
                    This conversation has been resolved.
                    {isAdmin && (
                      <p className="mt-2 text-xs text-slate-400">
                        Reply dene ke liye status ko Open ya In Progress karo.
                      </p>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-white/10 p-4 sm:p-5"
                  >
                    <label className="mb-2 block text-sm text-slate-400">
                      {isAdmin ? "Reply to customer" : "Your message"}
                    </label>
                    <div className="flex items-end gap-3">
                      <textarea
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        maxLength={3000}
                        rows={2}
                        required
                        placeholder="Type your message..."
                        className="min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={saving || !reply.trim()}
                        aria-label="Send message"
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Maximum 3000 characters.
                    </p>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
