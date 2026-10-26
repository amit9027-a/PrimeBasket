
import ProtectedRoute from "@/routes/ProtectedRoute";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  RefreshCw,
  Banknote,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateItemQuantity,
} from "@/features/cart/cartThunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatPrice } from "@/utils/formatPrice";
import {
  createPaymentOrder,
  placeCodOrder,
  verifyPayment,
  quoteGiftCard,
  type PaymentMethod,
  type GiftCardQuoteResponse,
} from "@/features/payment/paymentAPI";
import { loadRazorpay } from "@/utils/loadRazorpay";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: {
        description?: string;
        reason?: string;
      };
    }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  const [giftCardInput, setGiftCardInput] = useState("");
  const [appliedGiftCardCode, setAppliedGiftCardCode] = useState("");
  const [giftCardQuote, setGiftCardQuote] =
    useState<GiftCardQuoteResponse | null>(null);
  const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);
  const [giftCardMessage, setGiftCardMessage] = useState("");

  const hasAppliedGiftCard = Boolean(
    appliedGiftCardCode && giftCardQuote,
  );

  const payableAmount = hasAppliedGiftCard
    ? Math.max(0, giftCardQuote!.payableAmount)
    : totalPrice;

  const clearAppliedGiftCard = () => {
    setAppliedGiftCardCode("");
    setGiftCardQuote(null);
    setGiftCardMessage("");
  };

  useEffect(() => {
    void dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (
    itemId: number,
    quantity: number,
  ) => {
    if (quantity < 1 || busyItemId !== null || isClearing || isPlacingOrder) {
      return;
    }

    setBusyItemId(itemId);
    setCheckoutError("");

    try {
      await dispatch(updateItemQuantity({ itemId, quantity })).unwrap();
      clearAppliedGiftCard();
    } catch (err) {
      console.error("Unable to update cart quantity:", err);
      setCheckoutError("Quantity update failed. Please try again.");
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (busyItemId !== null || isClearing || isPlacingOrder) return;

    setBusyItemId(itemId);
    setCheckoutError("");

    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      clearAppliedGiftCard();
    } catch (err) {
      console.error("Unable to remove cart item:", err);
      setCheckoutError("Unable to remove this item. Please try again.");
    } finally {
      setBusyItemId(null);
    }
  };

  const handleClear = async () => {
    if (
      isClearing ||
      items.length === 0 ||
      busyItemId !== null ||
      isPlacingOrder
    ) {
      return;
    }

    setIsClearing(true);
    setCheckoutError("");

    try {
      await dispatch(clearCartItems()).unwrap();
      clearAppliedGiftCard();
      setGiftCardInput("");
    } catch (err) {
      console.error("Unable to clear cart:", err);
      setCheckoutError("Unable to clear your cart. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleApplyGiftCard = async () => {
    const code = giftCardInput.trim();

    if (!code) {
      setGiftCardMessage("Please enter a Gift Card code.");
      return;
    }

    if (items.length === 0) {
      setGiftCardMessage("Add products to your cart first.");
      return;
    }

    setIsApplyingGiftCard(true);
    setGiftCardMessage("");
    setCheckoutError("");

    try {
      const response = await quoteGiftCard({ code });
      const quote = response.data;

      setAppliedGiftCardCode(quote.code);
      setGiftCardQuote(quote);
      setGiftCardInput(quote.code);
      setGiftCardMessage(
        `Gift Card applied. You save ${formatPrice(quote.discount)}.`,
      );
    } catch (err: any) {
      setAppliedGiftCardCode("");
      setGiftCardQuote(null);
      setGiftCardMessage(
        err?.response?.data?.message ||
          "Unable to apply this Gift Card. Check the code and try again.",
      );
    } finally {
      setIsApplyingGiftCard(false);
    }
  };

  const handleRemoveGiftCard = () => {
    clearAppliedGiftCard();
    setGiftCardInput("");
    setCheckoutError("");
    setGiftCardMessage("Gift Card removed.");
  };

  const handleCheckout = async () => {
    const trimmedAddress = shippingAddress.trim();

    if (items.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    if (!trimmedAddress) {
      setCheckoutError("Please enter your complete shipping address.");
      return;
    }

    if (busyItemId !== null || isClearing || isPlacingOrder) return;

    if (hasAppliedGiftCard && giftCardQuote) {
      if (giftCardQuote.cartTotal + 0.01 < totalPrice) {
        clearAppliedGiftCard();
        setCheckoutError(
          "Your cart total changed. Please apply your Gift Card again.",
        );
        return;
      }
    }

    setIsPlacingOrder(true);
    setCheckoutError("");

    try {
      if (paymentMethod === "COD") {
        const response = await placeCodOrder({
          shippingAddress: trimmedAddress,
          giftCardCode: appliedGiftCardCode || null,
        });

        const order = response.data;

        setShippingAddress("");
        clearAppliedGiftCard();
        setGiftCardInput("");

        await dispatch(fetchCart()).unwrap();

        navigate("/orders", {
          state: {
            checkoutMessage: `Your COD order #${order.id} was placed successfully.`,
            highlightOrderId: order.id,
          },
        });

        return;
      }

      if (hasAppliedGiftCard && payableAmount <= 0) {
        throw new Error(
          "Your Gift Card covers the full cart. Please choose COD for this checkout.",
        );
      }

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please try again.",
        );
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error(
          "Payment configuration is missing. Please contact support.",
        );
      }

      // Send the Gift Card code to the backend so Razorpay receives
      // the discounted amount calculated by the server.
      const paymentResponse = await createPaymentOrder(
        appliedGiftCardCode || undefined,
      );

      const paymentOrder = paymentResponse.data;

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Prime Basket",
        description:
          paymentMethod === "CARD"
            ? "Secure card payment"
            : "Secure UPI payment",
        order_id: paymentOrder.orderId,

        handler: async (razorpayResponse) => {
          try {
            const orderResponse = await verifyPayment({
              shippingAddress: trimmedAddress,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
              paymentMethod,
              // Verify and redeem the same Gift Card used at checkout.
              giftCardCode: appliedGiftCardCode || null,
            });

            const order = orderResponse.data;

            setShippingAddress("");
            clearAppliedGiftCard();
            setGiftCardInput("");

            await dispatch(fetchCart()).unwrap();

            navigate("/orders", {
              state: {
                checkoutMessage: `${paymentMethod} payment successful. Order #${order.id} was placed successfully.`,
                highlightOrderId: order.id,
              },
            });
          } catch (err: any) {
            console.error("Order verification failed:", err);

            setCheckoutError(
              err?.response?.data?.message ||
                "Payment was submitted, but order confirmation failed. Save your Razorpay payment ID and contact support if you were charged.",
            );
          } finally {
            setIsPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            setCheckoutError(
              "Payment checkout was closed. Your cart is still available.",
            );
          },
        },

        theme: {
          color: "#3B82F6",
        },
      });

      razorpay.on("payment.failed", (response) => {
        setIsPlacingOrder(false);
        setCheckoutError(
          response.error?.description ||
            "Payment failed. Please try again or choose another method.",
        );
      });

      razorpay.open();
    } catch (err: any) {
      console.error("Checkout failed:", err);

      setCheckoutError(
        err?.response?.data?.message ||
          err?.message ||
          "Checkout could not be started. Please try again.",
      );

      setIsPlacingOrder(false);
    }
  };

  const isCartBusy =
    busyItemId !== null ||
    isClearing ||
    isPlacingOrder ||
    isApplyingGiftCard;

  return (
    <ProtectedRoute>
      <main className="relative min-h-screen overflow-hidden bg-[#0a0f19] pb-16 text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-500/[0.09] blur-[120px]" />
          <div className="absolute -left-40 top-[35rem] h-80 w-80 rounded-full bg-indigo-500/[0.07] blur-[110px]" />
        </div>

        <section className="relative border-b border-white/[0.07] bg-[#0d1421]/80">
          <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Continue shopping
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1.5">
                  <Sparkles size={13} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                    Your shopping space
                  </span>
                </div>

                <h1 className="mt-5 text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                  Your cart,
                  <br />
                  <span className="text-blue-400">your choices.</span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Everything you picked, together in one place. Review your
                  items and get ready for checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.09] bg-[#101827]/90 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Cart overview
                  </span>
                  <ShoppingBag size={19} className="text-blue-400" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Total items
                    </p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">
                      {totalItems}
                    </p>
                  </div>

                  <div className="border-l border-white/[0.09] pl-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Cart value
                    </p>
                    <p className="mt-2 break-words text-xl font-bold text-blue-300 sm:text-2xl">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          {loading && !initialized ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {[1, 2, 3].map((number) => (
                  <div
                    key={number}
                    className="h-40 animate-pulse rounded-2xl border border-white/[0.07] bg-[#101827]"
                  />
                ))}
              </div>
              <div className="h-96 animate-pulse rounded-2xl border border-white/[0.07] bg-[#101827]" />
            </div>
          ) : error && items.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8 text-center sm:p-12">
              <ShoppingBag className="mx-auto text-red-300" size={34} />
              <h2 className="mt-5 text-2xl font-bold">
                Couldn't load your cart
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
              <button
                type="button"
                onClick={() => void dispatch(fetchCart())}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.09] bg-gradient-to-b from-[#111a29] to-[#0d1421] px-6 py-14 text-center sm:px-12 sm:py-20">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-400/[0.08]">
                <ShoppingBag
                  size={34}
                  strokeWidth={1.5}
                  className="text-blue-300"
                />
              </div>

              <h2 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
                A little room for
                <br />
                <span className="text-blue-400">something good.</span>
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
                Your cart is empty for now. Explore the collection and find
                something you love.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-400"
              >
                Explore products
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-9">
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Your selection
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {totalItems} {totalItems === 1 ? "item" : "items"} in
                      your cart
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isCartBusy}
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-red-400/30 hover:bg-red-400/[0.05] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    {isClearing ? "Clearing..." : "Clear cart"}
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => {
                    const isBusy = busyItemId === item.id;

                    return (
                      <article
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101827]/90 p-4 transition duration-300 hover:border-blue-400/25 sm:p-5"
                      >
                        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-0 transition group-hover:opacity-100" />

                        <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5">
                          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-[#141e30] sm:aspect-auto sm:min-h-[145px]">
                            <img
                              src={item.imageUrl || "/default-img.webp"}
                              alt={item.productName}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src =
                                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
                              }}
                              className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.04]"
                            />

                            <span className="absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-[#080B12]/90 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-slate-300">
                              ITEM {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="flex min-w-0 flex-col justify-between gap-5 py-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-400">
                                  Selected product
                                </p>
                                <h3 className="mt-2 break-words text-xl font-semibold leading-snug text-white sm:text-2xl">
                                  {item.productName}
                                </h3>
                                <p className="mt-2 text-xs text-slate-500">
                                  Unit price{" "}
                                  <span className="font-medium text-slate-300">
                                    {formatPrice(item.unitPrice)}
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                aria-label={`Remove ${item.productName}`}
                                disabled={isCartBusy}
                                onClick={() => void handleRemove(item.id)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 transition hover:border-red-400/25 hover:bg-red-400/[0.06] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                  Quantity
                                </p>
                                <div className="mt-2 inline-flex items-center rounded-xl border border-white/[0.09] bg-[#080B12] p-1">
                                  <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    disabled={isCartBusy || item.quantity <= 1}
                                    onClick={() =>
                                      void handleQuantityChange(
                                        item.id,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="min-w-10 text-center text-sm font-bold tabular-nums">
                                    {isBusy ? "…" : item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    disabled={isCartBusy}
                                    onClick={() =>
                                      void handleQuantityChange(
                                        item.id,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-500/15 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                  Item subtotal
                                </p>
                                <p className="mt-2 text-xl font-bold tracking-tight text-blue-300">
                                  {formatPrice(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-300"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Shop with confidence
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Product availability and stock are validated by the
                      backend when your order is placed.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101827] shadow-2xl shadow-black/20">
                  <div className="border-b border-white/[0.08] bg-gradient-to-r from-blue-500/[0.12] to-transparent p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-blue-300">
                          Checkout
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight">
                          Order summary
                        </h2>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.08]">
                        <ShoppingBag size={20} className="text-blue-300" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="space-y-4">
                      <SummaryRow
                        label="Items in cart"
                        value={String(totalItems)}
                      />
                      <SummaryRow
                        label="Subtotal"
                        value={formatPrice(totalPrice)}
                      />
                      {hasAppliedGiftCard && giftCardQuote && (
                        <SummaryRow
                          label="Gift Card discount"
                          value={`−${formatPrice(giftCardQuote.discount)}`}
                        />
                      )}
                      <SummaryRow
                        label="Shipping"
                        value="Calculated at checkout"
                        muted
                      />
                    </div>

                    <div className="my-5 border-t border-dashed border-white/[0.12]" />

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Amount to pay
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                          Shipping or other charges may apply.
                        </p>
                      </div>
                      <p className="shrink-0 text-2xl font-bold tracking-tight text-blue-300">
                        {formatPrice(payableAmount)}
                      </p>
                    </div>

                    <div className="mt-7">
                      <p className="text-sm font-semibold text-slate-200">
                        Choose payment method
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-2.5">
                        <PaymentOption
                          selected={paymentMethod === "COD"}
                          onClick={() => {
                            setPaymentMethod("COD");
                            setCheckoutError("");
                          }}
                          icon={Banknote}
                          title="Cash on Delivery"
                          description="Pay when your order arrives"
                        />

                        <PaymentOption
                          selected={paymentMethod === "CARD"}
                          onClick={() => {
                            setPaymentMethod("CARD");
                            setCheckoutError("");
                          }}
                          icon={CreditCard}
                          title="Credit / Debit Card"
                          description="Pay securely with Razorpay"
                        />

                        <PaymentOption
                          selected={paymentMethod === "UPI"}
                          onClick={() => {
                            setPaymentMethod("UPI");
                            setCheckoutError("");
                          }}
                          icon={Smartphone}
                          title="UPI"
                          description="Pay using a supported UPI app"
                        />
                      </div>
                    </div>

                    <div className="mt-7 rounded-2xl border border-blue-400/15 bg-blue-400/[0.04] p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={17} className="text-blue-300" />
                        <h3 className="text-sm font-semibold text-slate-100">
                          Gift Card & discounts
                        </h3>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Apply an eligible Prime Basket Gift Card to reduce
                        your order total.
                      </p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={giftCardInput}
                          onChange={(event) => {
                            setGiftCardInput(event.target.value);
                            setGiftCardMessage("");
                          }}
                          disabled={isApplyingGiftCard || isPlacingOrder}
                          placeholder="Enter Gift Card code"
                          aria-label="Gift Card code"
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080B12] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 disabled:opacity-50"
                        />

                        {hasAppliedGiftCard ? (
                          <button
                            type="button"
                            onClick={handleRemoveGiftCard}
                            disabled={isApplyingGiftCard || isPlacingOrder}
                            className="rounded-xl border border-red-400/20 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/[0.07] disabled:opacity-50"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleApplyGiftCard()}
                            disabled={isApplyingGiftCard || isPlacingOrder}
                            className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50"
                          >
                            {isApplyingGiftCard ? "Checking..." : "Apply"}
                          </button>
                        )}
                      </div>

                      {giftCardMessage && (
                        <p
                          role="status"
                          className={`mt-3 text-xs leading-5 ${
                            hasAppliedGiftCard
                              ? "text-emerald-300"
                              : "text-slate-400"
                          }`}
                        >
                          {giftCardMessage}
                        </p>
                      )}

                      {hasAppliedGiftCard && giftCardQuote && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
                          <div>
                            <p className="text-xs font-semibold text-emerald-300">
                              Gift Card applied
                            </p>
                            <p className="mt-1 break-all text-[11px] text-slate-400">
                              {appliedGiftCardCode}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-emerald-300">
                            −{formatPrice(giftCardQuote.discount)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-7">
                      <label
                        htmlFor="shipping-address"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-200"
                      >
                        <Package size={15} className="text-blue-300" />
                        Delivery address
                      </label>

                      <textarea
                        id="shipping-address"
                        value={shippingAddress}
                        onChange={(event) => {
                          setShippingAddress(event.target.value);
                          setCheckoutError("");
                        }}
                        placeholder="House number, street, area, city, state, PIN code"
                        rows={4}
                        className="mt-3 min-h-28 w-full resize-y rounded-xl border border-white/[0.1] bg-[#080B12] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10"
                      />

                      <p className="mt-2 text-[11px] leading-5 text-slate-500">
                        Enter the complete address where you want your order
                        delivered.
                      </p>
                    </div>

                    {checkoutError && (
                      <div
                        role="alert"
                        className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3.5 text-xs leading-5 text-red-300"
                      >
                        {checkoutError}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isCartBusy || items.length === 0}
                      onClick={() => void handleCheckout()}
                      className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-400 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPlacingOrder ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          {paymentMethod === "COD"
                            ? "Placing order..."
                            : "Processing payment..."}
                        </>
                      ) : (
                        <>
                          {paymentMethod === "COD" ? (
                            <Banknote size={17} />
                          ) : (
                            <CreditCard size={17} />
                          )}
                          {paymentMethod === "COD"
                            ? "Place COD order"
                            : `Pay with ${paymentMethod}`}
                          <ArrowRight
                            size={16}
                            className="transition group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                      {paymentMethod === "COD" ? (
                        <>
                          <Truck size={12} />
                          <span>Pay when your order arrives</span>
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={12} />
                          <span>Payment checkout powered by Razorpay</span>
                        </>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-5">
                      <TrustItem
                        icon={ShieldCheck}
                        label="Secure checkout"
                      />
                      <TrustItem icon={Truck} label="Delivery details" />
                      <div className="col-span-2 flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-blue-300"
                        />
                        <span className="text-[10px] leading-4 text-slate-400">
                          Payment verification is handled by the backend.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 px-2 text-center text-[10px] leading-5 text-slate-600">
                  Review your order and delivery address before proceeding.
                </p>
              </aside>
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
};

const PaymentOption = ({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof CreditCard;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
      selected
        ? "border-blue-400/50 bg-blue-400/[0.08] ring-1 ring-blue-400/20"
        : "border-white/[0.08] bg-[#080B12] hover:border-white/[0.18]"
    }`}
  >
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
        selected
          ? "border-blue-400/30 bg-blue-400/[0.12] text-blue-300"
          : "border-white/[0.08] bg-white/[0.03] text-slate-400"
      }`}
    >
      <Icon size={18} />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-1 block text-[11px] leading-4 text-slate-500">
        {description}
      </span>
    </span>

    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-blue-400" : "border-slate-600"
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-blue-400" />}
    </span>
  </button>
);

const SummaryRow = ({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-slate-400">{label}</span>
    <span
      className={`max-w-[65%] text-right ${
        muted ? "text-xs text-slate-500" : "font-semibold text-slate-200"
      }`}
    >
      {value}
    </span>
  </div>
);

const TrustItem = ({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <Icon size={16} className="shrink-0 text-blue-300" />
    <span className="text-[10px] leading-4 text-slate-400">{label}</span>
  </div>
);

export default Cart;
