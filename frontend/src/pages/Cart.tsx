import ProtectedRoute from "@/routes/ProtectedRoute";
import { Link, useNavigate } from "react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateItemQuantity,
} from "@/features/cart/cartThunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatPrice } from "@/utils/formatPrice";
import { placeOrder } from "@/features/orders/orderAPI";
import { createPaymentOrder } from "@/features/payment/paymentAPI";
import { loadRazorpay } from "@/utils/loadRazorpay";

const FONTS = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  body: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
};

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, loading, error, initialized } =
    useAppSelector((state) => state.cart);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    dispatch(fetchCart()).catch(() => {
      // Surface handled via store state.
    });
  }, [dispatch]);

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    setBusyItemId(itemId);
    try {
      await dispatch(updateItemQuantity({ itemId, quantity })).unwrap();
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setBusyItemId(itemId);
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
    } finally {
      setBusyItemId(null);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await dispatch(clearCartItems()).unwrap();
    } finally {
      setIsClearing(false);
    }
  };

 const handleCheckout = async () => {
  const trimmedAddress = shippingAddress.trim();

  if (!trimmedAddress) {
    setCheckoutError(
      "Shipping address is required before placing the order.",
    );
    return;
  }

  setIsPlacingOrder(true);
  setCheckoutError("");

  try {
    // 1. Load Razorpay checkout script
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded) {
      throw new Error("Razorpay SDK could not be loaded.");
    }

    // 2. Create Razorpay order from backend
    const paymentResponse = await createPaymentOrder(totalPrice);
    const paymentOrder = paymentResponse.data;

    // 3. Open Razorpay checkout
    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "My Store",
      description: "Cart payment",
      order_id: paymentOrder.orderId,

      handler: async (response) => {
        try {
          // Payment successful
          const orderResponse = await placeOrder({
            shippingAddress: trimmedAddress,
          });

          setShippingAddress("");
          await dispatch(fetchCart()).unwrap();

          navigate("/orders", {
            state: {
              checkoutMessage: `Payment successful. Order #${orderResponse.data.id} was placed successfully.`,
              highlightOrderId: orderResponse.data.id,
            },
          });
        } catch (error: any) {
          setCheckoutError(
            error?.response?.data?.message ||
              "Payment succeeded, but order creation failed. Please contact support.",
          );
        } finally {
          setIsPlacingOrder(false);
        }
      },

      modal: {
        ondismiss: () => {
          setIsPlacingOrder(false);
          setCheckoutError("Payment was cancelled.");
        },
      },

      theme: {
        color: "#1F2A24",
      },
    });

    razorpay.open();
  } catch (error: any) {
    setCheckoutError(
      error?.response?.data?.message ||
        error?.message ||
        "Payment could not be started. Please try again.",
    );
    setIsPlacingOrder(false);
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
                  Basket ledger
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <h1
                className="m-0 text-[clamp(2.6rem,6vw,4.7rem)] leading-[0.98] tracking-[-0.03em] text-ink"
                style={{ fontFamily: FONTS.display, fontWeight: 500 }}
              >
                Your selected
                <br />
                <span className="italic font-normal text-moss">
                  store goods
                </span>
              </h1>

              <p
                className="mt-6 max-w-2xl text-base leading-7 text-inkSoft"
                style={{ fontFamily: FONTS.body }}
              >
                Review quantities, remove pieces, and keep track of the total
                before you move on to checkout.
              </p>
            </div>

            <div className="grid gap-4 rounded-[2px] border border-line bg-card p-6">
              <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                Cart summary
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                <Stat label="Items selected" value={String(totalItems)} />
                <Stat label="Current total" value={formatPrice(totalPrice)} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-10">
          {loading && !initialized ? (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse border border-line bg-paper-alt"
                  />
                ))}
              </div>
              <div className="h-72 animate-pulse border border-line bg-paper-alt" />
            </div>
          ) : error && items.length === 0 ? (
            <div className="rounded-[2px] border border-line bg-card p-8 text-center">
              <p
                className="text-2xl text-ink"
                style={{ fontFamily: FONTS.display, fontWeight: 500 }}
              >
                The cart could not be loaded
              </p>
              <p className="mt-3 text-sm text-inkSoft">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[2px] border border-line bg-card p-10 text-center">
              <ShoppingBag
                className="mx-auto text-moss"
                size={28}
                strokeWidth={1.6}
              />
              <p
                className="mt-5 text-3xl text-ink"
                style={{ fontFamily: FONTS.display, fontWeight: 500 }}
              >
                Your cart is empty
              </p>
              <p className="mt-3 text-sm text-inkSoft">
                Browse the catalogue and add a few products to start building an
                order.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex border border-line px-5 py-3 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-paper-alt"
              >
                Explore products
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="flex flex-col gap-4">
                {items.map((item, index) => {
                  const isBusy = busyItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="grid gap-5 border border-line bg-card p-4 md:grid-cols-[136px_1fr]"
                    >
                      <img
                        src={item.imageUrl || "/default-img.webp"}
                        alt={item.productName}
                        className="aspect-square w-full h-full border border-line bg-paper-alt object-cover"
                      />

                      <div className="flex flex-col justify-between gap-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <span className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                              Line item {String(index + 1).padStart(2, "0")}
                            </span>
                            <h2
                              className="mt-2 text-[1.35rem] leading-[1.2] text-ink"
                              style={{
                                fontFamily: FONTS.display,
                                fontWeight: 500,
                              }}
                            >
                              {item.productName}
                            </h2>
                            <p className="mt-2 text-sm text-inkSoft">
                              Unit price {formatPrice(item.unitPrice)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                              Subtotal
                            </p>
                            <p className="mt-2 text-lg text-ink">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              disabled={isBusy || item.quantity <= 1}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="px-3 py-2 text-ink transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-12 border-x border-line px-4 py-2 text-center font-mono text-sm text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="px-3 py-2 text-ink transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemove(item.id)}
                            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-moss uppercase disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="h-fit border border-line bg-card p-6">
                <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                  Order preview
                </p>

                <div className="mt-6 space-y-4 border-y border-line py-5 text-sm text-inkSoft">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span className="text-ink">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-ink">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="text-ink">Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
                      Total
                    </p>
                    <p
                      className="mt-2 text-3xl leading-none text-ink"
                      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
                    >
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-6">
                  <label
                    htmlFor="shipping-address"
                    className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase"
                  >
                    Shipping address
                  </label>
                  <textarea
                    id="shipping-address"
                    value={shippingAddress}
                    onChange={(event) => {
                      setShippingAddress(event.target.value);
                      setCheckoutError("");
                    }}
                    placeholder="House number, street, area, city, state, postal code"
                    className="mt-3 min-h-32 w-full rounded-none border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink placeholder:text-inkFaint focus:outline-2 focus:outline-moss focus:outline-offset-2"
                    style={{ fontFamily: FONTS.body }}
                  />
                  <p className="mt-3 text-xs leading-6 text-inkFaint">
                    The backend checkout API accepts only a shipping address, so
                    this field is required to place the order.
                  </p>
                  {checkoutError ? (
                    <p className="mt-3 text-sm text-[#9A3F32]">
                      {checkoutError}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={isPlacingOrder || items.length === 0}
                  onClick={handleCheckout}
                  className="mt-6 w-full border border-ink bg-ink px-5 py-3 font-mono text-[11px] tracking-[0.08em] text-paper uppercase disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPlacingOrder ? "Placing order" : "Place order"}
                </button>

                <button
                  type="button"
                  disabled={isClearing || items.length === 0}
                  onClick={handleClear}
                  className="mt-6 w-full border border-line px-4 py-3 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClearing ? "Clearing cart" : "Clear cart"}
                </button>

                <p className="mt-4 text-xs leading-6 text-inkFaint">
                  Stock is validated again by the backend during checkout, so
                  the final order stays consistent with inventory.
                </p>
              </aside>
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-mono text-[11px] tracking-[0.08em] text-inkFaint uppercase">
      {label}
    </p>
    <p
      className="mt-2 text-3xl leading-none text-ink"
      style={{ fontFamily: FONTS.display, fontWeight: 500 }}
    >
      {value}
    </p>
  </div>
);

export default Cart;
