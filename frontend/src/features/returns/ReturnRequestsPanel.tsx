
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import {
  createReturnRequest,
  getMyReturnRequests,
  type ReturnRequestResponse,
  type ReturnStatus,
} from "./returnAPI";

interface DeliveredOrder {
  id: number;
  status: string;
  totalAmount: number;
}

interface ReturnRequestsPanelProps {
  orders: DeliveredOrder[];
}

const REASONS = [
  "Damaged product",
  "Wrong product received",
  "Product missing",
  "Product not as described",
  "Quality issue",
  "Other",
];

const STATUS_STYLES: Record<ReturnStatus, string> = {
  PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  RECEIVED: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  REFUND_PENDING: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  REFUNDED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  REFUND_FAILED: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const REFUND_LABELS: Record<string, string> = {
  MANUAL_REQUIRED: "Manual refund required",
  NOT_REQUIRED: "Refund not required",
  PENDING: "Refund pending",
  PROCESSING: "Refund processing",
  COMPLETED: "Refund completed",
  FAILED: "Refund failed",
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const ReturnRequestsPanel = ({ orders }: ReturnRequestsPanelProps) => {
  const [requests, setRequests] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyReturnRequests();
      setRequests(response.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;

      setError(message || "Return requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const requestedOrderIds = useMemo(
    () => new Set(requests.map((request) => request.orderId)),
    [requests],
  );

  const eligibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "DELIVERED" &&
          !requestedOrderIds.has(order.id),
      ),
    [orders, requestedOrderIds],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedOrderId) {
      setError("Please select a delivered order.");
      return;
    }

    if (!reason.trim() || reason.length > 100) {
      setError("Please select a valid return reason.");
      return;
    }

    if (description.length > 1000) {
      setError("Description must not exceed 1000 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createReturnRequest({
        orderId: Number(selectedOrderId),
        reason,
        description: description.trim(),
      });

      setRequests((current) => [
        response.data,
        ...current.filter((item) => item.id !== response.data.id),
      ]);

      setMessage(`Return request for order #${selectedOrderId} submitted.`);
      setSelectedOrderId("");
      setReason(REASONS[0]);
      setDescription("");
      setFormOpen(false);
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;

      setError(apiMessage || "Could not submit the return request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101827]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <RotateCcw size={21} />
          </span>

          <div>
            <h2 className="text-lg font-bold text-white">
              Returns & refunds
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Request a return for a delivered order and track its status.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setFormOpen((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <RotateCcw size={15} />
            {formOpen ? "Close form" : "Request return"}
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {message && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-sm text-rose-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-blue-400/15 bg-[#0b1220] p-4 sm:p-5"
          >
            <div>
              <h3 className="font-semibold text-white">New return request</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Only delivered orders without an existing return request are
                available here. The server will validate eligibility.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="return-order"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Delivered order
                </label>
                <select
                  id="return-order"
                  value={selectedOrderId}
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#101827] px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  <option value="">Select an order</option>
                  {eligibleOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} — {formatPrice(order.totalAmount)}
                    </option>
                  ))}
                </select>

                {eligibleOrders.length === 0 && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    No eligible delivered orders found.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="return-reason"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Reason for return
                </label>
                <select
                  id="return-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#101827] px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="return-description"
                  className="text-sm text-slate-300"
                >
                  Additional details
                </label>
                <span className="text-xs text-slate-500">
                  {description.length}/1000
                </span>
              </div>
              <textarea
                id="return-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Tell us more about the issue (optional)"
                className="w-full resize-y rounded-xl border border-white/10 bg-[#101827] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || eligibleOrders.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <RefreshCw size={16} className="animate-spin" />
              )}
              {submitting ? "Submitting..." : "Submit return request"}
            </button>
          </form>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">My return requests</h3>
              <p className="mt-1 text-xs text-slate-500">
                {requests.length}{" "}
                {requests.length === 1 ? "request" : "requests"}
              </p>
            </div>
            <ShieldCheck size={19} className="text-blue-300" />
          </div>

          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] p-5 text-sm text-slate-400">
              <RefreshCw size={17} className="animate-spin" />
              Loading return requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
              <RotateCcw size={25} className="mx-auto text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-300">
                No return requests yet
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your submitted requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-xl border border-white/[0.07] bg-[#0b1220] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Return #{request.id} · Order #{request.orderId}
                      </p>
                      <h4 className="mt-2 break-words font-semibold text-white">
                        {request.reason}
                      </h4>
                      {request.description && (
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                          {request.description}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-slate-500">
                        Submitted {formatDate(request.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          STATUS_STYLES[request.status] ||
                          "border-white/10 bg-white/5 text-slate-300"
                        }`}
                      >
                        <Clock3 size={13} />
                        {request.status.replaceAll("_", " ")}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {formatPrice(request.orderTotal)}
                      </span>
                    </div>
                  </div>

                  {request.refundStatus && (
                    <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Refund status
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-200">
                        {REFUND_LABELS[request.refundStatus] ||
                          request.refundStatus.replaceAll("_", " ")}
                      </p>
                    </div>
                  )}

                  {request.adminNote && (
                    <div className="mt-3 rounded-lg border border-blue-400/10 bg-blue-400/[0.04] p-3">
                      <p className="text-[11px] uppercase tracking-wider text-blue-300">
                        Admin note
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                        {request.adminNote}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReturnRequestsPanel;
