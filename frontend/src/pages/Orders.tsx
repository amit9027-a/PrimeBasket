import ProtectedRoute from "@/routes/ProtectedRoute";
import {
  cancelOrder,
  getOrders,
  updateOrderStatus,
  type OrderResponse,
  type OrderStatus,
} from "@/features/orders/orderAPI";
import { formatPrice } from "@/utils/formatPrice";
import { ArrowUpRight, Package, ShieldCheck, Truck, Undo2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";

const FONTS = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  body: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[rgba(173,138,82,0.12)] text-[#8A6938] border-[rgba(173,138,82,0.3)]",
  CONFIRMED: "bg-[rgba(66,80,47,0.1)] text-moss border-[rgba(66,80,47,0.25)]",
  SHIPPED: "bg-[rgba(38,84,124,0.1)] text-[#26547C] border-[rgba(38,84,124,0.25)]",
  DELIVERED: "bg-[rgba(31,127,92,0.1)] text-[#1F7F5C] border-[rgba(31,127,92,0.25)]",
  CANCELLED: "bg-[rgba(154,63,50,0.08)] text-[#9A3F32] border-[rgba(154,63,50,0.2)]",
};

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const canCancelOrder = (status: OrderResponse["status"]) =>
  status !== "CANCELLED" && status !== "SHIPPED" && status !== "DELIVERED";

const ADMIN_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const Orders = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string>(
    (location.state as { checkoutMessage?: string } | null)?.checkoutMessage || "",
  );
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(
    (location.state as { highlightOrderId?: number } | null)?.highlightOrderId || null,
  );
  const [busyCancelId, setBusyCancelId] = useState<number | null>(null);
  const [busyStatusId, setBusyStatusId] = useState<number | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getOrders();
        setOrders(response.data);
        setExpandedOrderId((current) => current ?? response.data[0]?.id ?? null);
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            "Orders could not be loaded right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "CANCELLED").length;
    const totalSpent = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const uniqueCustomers = new Set(orders.map((order) => order.customerEmail)).size;
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;

    return {
      totalOrders: orders.length,
      activeOrders,
      totalSpent,
      uniqueCustomers,
      deliveredOrders,
    };
  }, [orders]);

  const handleCancelOrder = async (orderId: number) => {
    setBusyCancelId(orderId);
    setMessage("");

    try {
      const response = await cancelOrder(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data : order)),
      );
      setMessage(`Order #${orderId} has been cancelled.`);
    } catch (cancelError: any) {
      setError(
        cancelError?.response?.data?.message ||
          "This order could not be cancelled.",
      );
    } finally {
      setBusyCancelId(null);
    }
  };

  const handleAdminStatusUpdate = async (orderId: number, status: OrderStatus) => {
    setBusyStatusId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await updateOrderStatus(orderId, { status });
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.data : order)),
      );
      setMessage(`Order #${orderId} moved to ${status}.`);
    } catch (updateError: any) {
      setError(
        updateError?.response?.data?.message ||
          "The order status could not be updated.",
      );
    } finally {
      setBusyStatusId(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-paper pb-20">
        <section className="border-b border-line bg-paper-alt/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="font-mono text-xs tracking-[0.08em] text-moss uppercase">
                  {isAdmin ? "Order command" : "Purchase archive"}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <h1
                className="m-0 text-[clamp(2.6rem,6vw,4.7rem)] leading-[0.98] tracking-[-0.03em] text-ink"
                style={{ fontFamily: FONTS.display, fontWeight: 500 }}
              >
                Review your
                <br />
                <span className="italic font-normal text-moss">
                  {isAdmin ? "customer orders" : "order history"}
                </span>
              </h1>

              <p
                className="mt-6 max-w-2xl text-base leading-7 text-inkSoft"
                style={{ fontFamily: FONTS.body }}
              >
                {isAdmin
                  ? "This dashboard reads every order from the backend and lets you update fulfillment status inline, so the admin workflow stays aligned with the server."
                  : "This page reads directly from the backend orders API, so every status change, cancellation, and line item stays aligned with the server."}
              </p>
            </div>

            <div className="grid gap-4 rounded-[2px] border border-line bg-card p-6">
              <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                {isAdmin ? "Dashboard summary" : "Order summary"}
              </p>
              <div className={`grid gap-4 border-t border-line pt-4 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                <Stat label="Orders" value={String(stats.totalOrders)} />
                <Stat label="Active" value={String(stats.activeOrders)} />
                {isAdmin ? (
                  <>
                    <Stat label="Customers" value={String(stats.uniqueCustomers)} />
                    <Stat label="Delivered" value={String(stats.deliveredOrders)} />
                  </>
                ) : (
                  <Stat label="Spent" value={formatPrice(stats.totalSpent)} />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-10">
          {message ? (
            <div className="mb-6 border border-[rgba(66,80,47,0.2)] bg-[rgba(66,80,47,0.08)] px-5 py-4 text-sm text-moss">
              {message}
            </div>
          ) : null}

          {error && !loading ? (
            <div className="mb-6 border border-[rgba(154,63,50,0.2)] bg-[rgba(154,63,50,0.06)] px-5 py-4 text-sm text-[#9A3F32]">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-52 animate-pulse border border-line bg-paper-alt" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[2px] border border-line bg-card p-10 text-center">
              <Package className="mx-auto text-moss" size={28} strokeWidth={1.6} />
              <p className="mt-5 text-3xl text-ink" style={{ fontFamily: FONTS.display, fontWeight: 500 }}>
                No orders yet
              </p>
              <p className="mt-3 text-sm text-inkSoft">
                When you place your first order from the cart, it will appear here with status and item details.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex border border-line px-5 py-3 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-paper-alt"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {isAdmin ? (
                <div className="grid gap-4 border border-line bg-card p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                      Admin controls
                    </p>
                    <p className="mt-2 text-sm leading-6 text-inkSoft">
                      You are viewing all customer orders. Use the status selector inside each order card to move orders through the backend fulfillment flow.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-moss uppercase">
                    <Users size={14} />
                    {stats.uniqueCustomers} customers
                  </div>
                  <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-ink uppercase">
                    <ShieldCheck size={14} />
                    Admin mode
                  </div>
                </div>
              ) : null}

              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const isCancelling = busyCancelId === order.id;
                const isUpdatingStatus = busyStatusId === order.id;

                return (
                  <article key={order.id} className="border border-line bg-card">
                    <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="grid gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                Order #{order.id}
                              </span>
                              <span
                                className={`border px-2 py-1 font-mono text-[10px] tracking-[0.08em] uppercase ${STATUS_STYLES[order.status]}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <h2
                              className="mt-3 text-[1.6rem] leading-[1.15] text-ink"
                              style={{ fontFamily: FONTS.display, fontWeight: 500 }}
                            >
                              {formatPrice(order.totalAmount)}
                            </h2>
                            <p className="mt-2 text-sm text-inkSoft">
                              Placed on {formatOrderDate(order.createdAt)}
                            </p>
                            {isAdmin ? (
                              <p className="mt-1 text-sm text-inkSoft">
                                Customer {order.customerEmail}
                              </p>
                            ) : null}
                          </div>

                          <div className="grid gap-2 text-right">
                            <span className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                              {order.items.length} item{order.items.length === 1 ? "" : "s"}
                            </span>
                            <span className="text-sm text-inkSoft">{order.shippingAddress}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId((current) =>
                                current === order.id ? null : order.id,
                              )
                            }
                            className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-paper-alt"
                          >
                            Details
                            <ArrowUpRight size={14} />
                          </button>

                          {isAdmin ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <select
                                value={order.status}
                                disabled={isUpdatingStatus}
                                onChange={(event) =>
                                  handleAdminStatusUpdate(order.id, event.target.value as OrderStatus)
                                }
                                className="rounded-none border border-line bg-paper px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-ink uppercase disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {ADMIN_STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <span className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                {isUpdatingStatus ? "Updating status..." : "Status control"}
                              </span>
                            </div>
                          ) : canCancelOrder(order.status) ? (
                            <button
                              type="button"
                              disabled={isCancelling}
                              onClick={() => handleCancelOrder(order.id)}
                              className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-moss uppercase transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Undo2 size={14} />
                              {isCancelling ? "Cancelling" : "Cancel order"}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                              <Truck size={14} />
                              {order.status === "CANCELLED"
                                ? "Order cancelled"
                                : "Cannot cancel now"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-line bg-paper-alt/45 px-5 py-5">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                          <div>
                            <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                              Order items
                            </p>
                            <div className="mt-4 grid gap-3">
                              {order.items.map((item, index) => (
                                <div
                                  key={item.id}
                                  className="grid gap-3 border border-line bg-card p-4 md:grid-cols-[1fr_auto]"
                                >
                                  <div>
                                    <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                      Item {String(index + 1).padStart(2, "0")}
                                    </p>
                                    <h3
                                      className="mt-2 text-xl text-ink"
                                      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
                                    >
                                      {item.productName}
                                    </h3>
                                    <p className="mt-2 text-sm text-inkSoft">
                                      Quantity {item.quantity} at {formatPrice(item.price)} each
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                      Line total
                                    </p>
                                    <p className="mt-2 text-lg text-ink">
                                      {formatPrice(item.subtotal)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="h-fit border border-line bg-card p-5">
                            <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                              {isAdmin ? "Order control" : "Delivery details"}
                            </p>
                            <div className="mt-4 space-y-4 text-sm text-inkSoft">
                              {isAdmin ? (
                                <div>
                                  <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                    Customer
                                  </p>
                                  <p className="mt-2 leading-6 text-ink">
                                    {order.customerEmail}
                                  </p>
                                </div>
                              ) : null}
                              <div>
                                <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                  Shipping address
                                </p>
                                <p className="mt-2 leading-6 text-ink">
                                  {order.shippingAddress}
                                </p>
                              </div>
                              <div>
                                <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                  Current status
                                </p>
                                <p className="mt-2 text-ink">{order.status}</p>
                              </div>
                              {isAdmin ? (
                                <div>
                                  <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                                    Order total
                                  </p>
                                  <p className="mt-2 text-ink">{formatPrice(order.totalAmount)}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">{label}</p>
    <p
      className="mt-2 text-2xl leading-none text-ink"
      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
    >
      {value}
    </p>
  </div>
);

export default Orders;
