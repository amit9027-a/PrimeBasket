
import ProtectedRoute from "@/routes/ProtectedRoute";
import {
  cancelOrder,
  getOrders,
  updateOrderStatus,
  type OrderResponse,
  type OrderStatus,
} from "@/features/orders/orderAPI";
import ReturnRequestsPanel from "@/features/returns/ReturnRequestsPanel";
import { formatPrice } from "@/utils/formatPrice";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Undo2,
  Users,
  MapPin,
  CircleCheck,
  Circle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  CONFIRMED: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  SHIPPED: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  DELIVERED: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-rose-400/25 bg-rose-400/10 text-rose-300",
};

const ADMIN_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const TRACKING_STEPS = [
  {
    status: "PENDING",
    title: "Order placed",
    description: "Your order has been received.",
  },
  {
    status: "CONFIRMED",
    title: "Order confirmed",
    description: "Your order has been confirmed.",
  },
  {
    status: "SHIPPED",
    title: "Shipped",
    description: "Your order is on its way.",
  },
  {
    status: "DELIVERED",
    title: "Delivered",
    description: "Your order has been delivered.",
  },
];

const formatOrderDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const canCancelOrder = (status: OrderResponse["status"]) =>
  status !== "CANCELLED" &&
  status !== "SHIPPED" &&
  status !== "DELIVERED";

const OrderTimeline = ({ order }: { order: OrderResponse }) => {
  const isCancelled = order.status === "CANCELLED";
  const currentIndex = TRACKING_STEPS.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <section className="mt-5 rounded-2xl border border-violet-400/15 bg-[#101827] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
            <Truck size={20} />
          </span>
          <div>
            <h3 className="font-semibold text-white">
              Order progress
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Order #{order.id}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            STATUS_STYLES[order.status] ||
            "border-white/10 bg-white/[0.05] text-slate-300"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      {isCancelled ? (
        <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-5">
          <h4 className="font-semibold text-rose-200">
            Order cancelled
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            This order is cancelled. Contact customer support if you
            need help with your order.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-7">
            {TRACKING_STEPS.map((step, index) => {
              const isComplete = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isReached = index <= currentIndex;

              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex w-7 shrink-0 flex-col items-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                        isComplete
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : isCurrent
                            ? "border-blue-400/40 bg-blue-400/15 text-blue-300"
                            : "border-white/10 bg-white/[0.03] text-slate-600"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 size={17} />
                      ) : isReached ? (
                        <CircleCheck size={17} />
                      ) : (
                        <Circle size={16} />
                      )}
                    </span>

                    {index < TRACKING_STEPS.length - 1 && (
                      <span
                        className={`my-1 min-h-9 w-px flex-1 ${
                          isComplete
                            ? "bg-emerald-400/40"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-semibold ${
                          isReached ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {step.title}
                      </h4>

                      {isCurrent && (
                        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                          Current status
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#0b1220] p-4">
            <div className="flex items-start gap-3">
              <Clock3
                size={17}
                className="mt-0.5 shrink-0 text-violet-300"
              />
              <p className="text-xs leading-6 text-slate-400">
                Tracking reflects the latest order status available
                from Prime Basket. It does not provide a live courier
                GPS location.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

const Orders = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState(
    (location.state as { checkoutMessage?: string } | null)
      ?.checkoutMessage || "",
  );

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(
    null,
  );
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(
    null,
  );

  const [busyCancelId, setBusyCancelId] = useState<number | null>(null);
  const [busyStatusId, setBusyStatusId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getOrders();
      setOrders(response.data);
      setExpandedOrderId(null);
      setTrackingOrderId(null);
    } catch (loadError: unknown) {
      const apiError = loadError as {
        response?: { data?: { message?: string } };
      };

      setError(
        apiError.response?.data?.message ||
          "Orders could not be loaded right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== "CANCELLED",
    );

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      totalSpent: activeOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      ),
      uniqueCustomers: new Set(
        orders.map((order) => order.customerEmail),
      ).size,
      deliveredOrders: orders.filter(
        (order) => order.status === "DELIVERED",
      ).length,
    };
  }, [orders]);

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${orderId}?`,
    );

    if (!confirmed) return;

    setBusyCancelId(orderId);
    setMessage("");
    setError("");

    try {
      const response = await cancelOrder(orderId);

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? response.data : order,
        ),
      );

      setMessage(`Order #${orderId} has been cancelled successfully.`);
    } catch (cancelError: unknown) {
      const apiError = cancelError as {
        response?: { data?: { message?: string } };
      };

      setError(
        apiError.response?.data?.message ||
          "This order could not be cancelled.",
      );
    } finally {
      setBusyCancelId(null);
    }
  };

  const handleAdminStatusUpdate = async (
    orderId: number,
    status: OrderStatus,
  ) => {
    const currentOrder = orders.find((order) => order.id === orderId);

    if (!currentOrder || currentOrder.status === status) return;

    setBusyStatusId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await updateOrderStatus(orderId, { status });

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? response.data : order,
        ),
      );

      setMessage(`Order #${orderId} status updated to ${status}.`);
    } catch (updateError: unknown) {
      const apiError = updateError as {
        response?: { data?: { message?: string } };
      };

      setError(
        apiError.response?.data?.message ||
          "The order status could not be updated.",
      );
    } finally {
      setBusyStatusId(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0a0f19] pb-16 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#0d1422]">
          <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-blue-500/[0.10] blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-36 left-1/4 h-72 w-72 rounded-full bg-indigo-500/[0.07] blur-[100px]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-8">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
                  <Package size={20} />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    {isAdmin ? "Admin workspace" : "Your purchases"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Prime Basket / Orders
                  </p>
                </div>
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {isAdmin ? (
                  <>
                    Order <span className="text-blue-400">management.</span>
                  </>
                ) : (
                  <>
                    Your orders,
                    <br />
                    <span className="text-blue-400">your journey.</span>
                  </>
                )}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                {isAdmin
                  ? "Manage customer purchases, review order details and keep fulfillment status up to date."
                  : "Everything you have ordered, organized in one place. Check your purchases, review delivery details and manage eligible orders."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  <ShoppingBag size={17} />
                  Browse products
                  <ArrowUpRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => void loadOrders()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh orders
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/[0.09] bg-[#111a29]/90 p-5 shadow-2xl shadow-black/10 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isAdmin ? "Store overview" : "Order overview"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Based on loaded orders
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
                  <ShieldCheck size={20} />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <Stat
                  label="Total orders"
                  value={String(stats.totalOrders)}
                  icon={<Package size={16} />}
                />

                <Stat
                  label="Active"
                  value={String(stats.activeOrders)}
                  icon={<Clock3 size={16} />}
                />

                {isAdmin ? (
                  <>
                    <Stat
                      label="Customers"
                      value={String(stats.uniqueCustomers)}
                      icon={<Users size={16} />}
                    />
                    <Stat
                      label="Delivered"
                      value={String(stats.deliveredOrders)}
                      icon={<CheckCircle2 size={16} />}
                    />
                  </>
                ) : (
                  <div className="col-span-2 rounded-xl border border-blue-400/15 bg-blue-400/[0.06] p-4 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                    <p className="text-xs text-slate-400">Total spent</p>
                    <p className="mt-2 break-words text-xl font-bold text-blue-300 sm:text-2xl">
                      {formatPrice(stats.totalSpent)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Excludes cancelled orders
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 sm:pt-10 lg:px-8">
          {/* Customer return and refund panel */}
          {!isAdmin && !loading && (
            <ReturnRequestsPanel
              orders={orders.map((order) => ({
                id: order.id,
                status: order.status,
                totalAmount: order.totalAmount,
              }))}
            />
          )}

          {message && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-4 text-sm text-emerald-300 sm:px-5"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p className="flex-1 leading-6">{message}</p>
              <button
                type="button"
                onClick={() => setMessage("")}
                className="text-emerald-300/70 transition hover:text-emerald-200"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {error && !loading && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-4 text-sm text-rose-300 sm:px-5"
            >
              <span className="flex-1 leading-6">{error}</span>
              <button
                type="button"
                onClick={() => void loadOrders()}
                className="shrink-0 font-semibold text-rose-200 underline underline-offset-4 hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/[0.08] bg-[#101827] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="h-3 w-28 rounded bg-white/10" />
                      <div className="h-7 w-36 rounded bg-white/10" />
                      <div className="h-3 w-48 rounded bg-white/[0.06]" />
                    </div>
                    <div className="h-10 w-28 rounded-xl bg-white/[0.06]" />
                  </div>
                  <div className="mt-6 h-px bg-white/[0.06]" />
                  <div className="mt-5 h-10 w-36 rounded-xl bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101827] px-5 py-14 text-center sm:px-10 sm:py-20">
              <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[70px]" />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/[0.08] text-blue-400">
                <ShoppingBag size={34} strokeWidth={1.5} />
              </div>

              <h2 className="relative mt-6 text-2xl font-bold text-white sm:text-3xl">
                No orders yet
              </h2>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                {isAdmin
                  ? "No customer orders are available yet. New orders will appear here when customers make purchases."
                  : "Your next great find is waiting. Explore our collection and your purchases will appear here."}
              </p>

              <Link
                to="/products"
                className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Explore products
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {isAdmin && (
                <div className="flex flex-col gap-4 rounded-2xl border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.08] to-[#111a29] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
                      <ShieldCheck size={21} />
                    </span>

                    <div>
                      <h2 className="font-semibold text-white">
                        Admin order controls
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                        Review customer purchases and update each order's
                        fulfillment status using the controls below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Users size={17} className="text-blue-400" />
                    <span>
                      <strong className="text-white">
                        {stats.uniqueCustomers}
                      </strong>{" "}
                      customers
                    </span>
                  </div>
                </div>
              )}

              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const isTracking = trackingOrderId === order.id;
                const isCancelling = busyCancelId === order.id;
                const isUpdatingStatus = busyStatusId === order.id;

                return (
                  <article
                    key={order.id}
                    className={`overflow-hidden rounded-2xl border bg-[#101827] transition-colors ${
                      isExpanded || isTracking
                        ? "border-blue-400/20"
                        : "border-white/[0.08] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Order #{order.id}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                STATUS_STYLES[order.status] ||
                                "border-white/10 bg-white/[0.05] text-slate-300"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {order.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          <p className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            {formatPrice(order.totalAmount)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 sm:text-sm">
                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={15} className="text-blue-400" />
                              {formatOrderDate(order.createdAt)}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <Package size={15} className="text-blue-400" />
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </span>
                          </div>

                          {isAdmin && (
                            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 sm:max-w-xl">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Customer email
                              </p>
                              <p className="mt-1 break-all text-sm text-slate-300">
                                {order.customerEmail}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-white/[0.07] bg-[#0b1220] p-4 xl:w-72 xl:shrink-0">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <MapPin size={15} className="text-blue-400" />
                            Delivery address
                          </div>

                          <p className="mt-3 break-words text-sm leading-6 text-slate-300">
                            {order.shippingAddress || "Address not available"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setTrackingOrderId((current) =>
                              current === order.id ? null : order.id,
                            )
                          }
                          aria-expanded={isTracking}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                        >
                          <Truck size={16} />
                          {isTracking ? "Hide tracking" : "Track order"}
                          {isTracking ? (
                            <ArrowDownRight size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId((current) =>
                              current === order.id ? null : order.id,
                            )
                          }
                          aria-expanded={isExpanded}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.06] hover:text-white"
                        >
                          {isExpanded ? "Hide details" : "View details"}
                          {isExpanded ? (
                            <ArrowDownRight size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </button>

                        {isAdmin ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label
                              htmlFor={`status-${order.id}`}
                              className="text-xs text-slate-400"
                            >
                              Update status
                            </label>

                            <select
                              id={`status-${order.id}`}
                              value={order.status}
                              disabled={isUpdatingStatus}
                              onChange={(event) =>
                                void handleAdminStatusUpdate(
                                  order.id,
                                  event.target.value as OrderStatus,
                                )
                              }
                              className="min-w-40 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {ADMIN_STATUS_OPTIONS.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#101827] text-white"
                                >
                                  {status.replaceAll("_", " ")}
                                </option>
                              ))}
                            </select>

                            {isUpdatingStatus && (
                              <span className="inline-flex items-center gap-2 text-xs text-blue-300">
                                <RefreshCw
                                  size={13}
                                  className="animate-spin"
                                />
                                Updating...
                              </span>
                            )}
                          </div>
                        ) : canCancelOrder(order.status) ? (
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => void handleCancelOrder(order.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.04] px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Undo2 size={16} />
                            )}
                            {isCancelling ? "Cancelling..." : "Cancel order"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-1 text-xs text-slate-500">
                            <ShieldCheck size={15} />
                            {order.status === "CANCELLED"
                              ? "This order is cancelled"
                              : order.status === "DELIVERED"
                                ? "Order delivered"
                                : "Cancellation unavailable"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isTracking && (
                      <div className="border-t border-white/[0.08] bg-[#0b1220]/70 p-4 sm:p-6">
                        <OrderTimeline order={order} />
                      </div>
                    )}

                    {isExpanded && (
                      <div className="border-t border-white/[0.08] bg-[#0b1220]/70 p-4 sm:p-6">
                        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-white">
                                  Order items
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                  Products included in this purchase
                                </p>
                              </div>

                              <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                                {order.items.length} items
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3">
                              {order.items.map((item, index) => (
                                <div
                                  key={item.id}
                                  className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#101827] p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.07] text-blue-400">
                                      <Package size={20} />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Item {String(index + 1).padStart(2, "0")}
                                      </p>

                                      <h4 className="mt-1 break-words font-semibold text-white">
                                        {item.productName}
                                      </h4>

                                      <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Qty: {item.quantity} ×{" "}
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="border-t border-white/[0.06] pt-3 sm:border-0 sm:pt-0 sm:text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                      Item subtotal
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                      {formatPrice(item.subtotal)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#101827] p-5">
                            <h3 className="font-semibold text-white">
                              {isAdmin
                                ? "Order information"
                                : "Delivery details"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Purchase and fulfillment summary
                            </p>

                            <div className="mt-5 space-y-5">
                              {isAdmin && (
                                <InfoRow
                                  label="Customer"
                                  value={order.customerEmail || "Unavailable"}
                                />
                              )}

                              <InfoRow
                                label="Order ID"
                                value={`#${order.id}`}
                              />

                              <InfoRow
                                label="Order date"
                                value={formatOrderDate(order.createdAt)}
                              />

                              <InfoRow
                                label="Shipping address"
                                value={order.shippingAddress || "Unavailable"}
                              />

                              <div className="border-t border-white/[0.07] pt-4">
                                <p className="text-xs text-slate-500">
                                  Current status
                                </p>

                                <span
                                  className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                    STATUS_STYLES[order.status] ||
                                    "border-white/10 bg-white/[0.05] text-slate-300"
                                  }`}
                                >
                                  {order.status.replaceAll("_", " ")}
                                </span>
                              </div>

                              <div className="rounded-xl border border-blue-400/15 bg-blue-400/[0.05] p-4">
                                <p className="text-xs text-slate-400">
                                  Order total
                                </p>
                                <p className="mt-2 text-2xl font-bold text-blue-300">
                                  {formatPrice(order.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </aside>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="mt-7 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="shrink-0 text-blue-400" />
                <p className="text-xs leading-5 text-slate-400">
                  Order information is loaded from your Prime Basket backend.
                </p>
              </div>

              <span className="text-xs text-slate-500">
                Showing {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
};

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl border border-white/[0.07] bg-[#0b1220] p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-slate-400">{label}</p>
      <span className="text-blue-400">{icon}</span>
    </div>
    <p className="mt-3 break-words text-2xl font-bold tracking-tight text-white">
      {value}
    </p>
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm leading-6 text-slate-200">
      {value}
    </p>
  </div>
);

export default Orders;
