
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  LoaderCircle,
  Package,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { getWishlist, removeFromWishlist, type WishlistItem } from "@/features/wishlist/wishlistAPI";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks";
import { addItem } from "@/features/cart/cartThunks";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Unable to load wishlist:", err);
      setError(
        "We couldn't load your wishlist. Please sign in and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId: number) => {
    if (removingId !== null || addingId !== null) return;

    setRemovingId(productId);
    setError("");
    setNotice("");

    try {
      await removeFromWishlist(productId);

      setItems((current) =>
        current.filter((item) => item.productId !== productId)
      );

      setNotice("Product removed from your wishlist.");
    } catch (err) {
      console.error("Unable to remove wishlist item:", err);
      setError("Couldn't remove this product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (item.stockQuantity <= 0 || addingId !== null || removingId !== null) {
      return;
    }

    setAddingId(item.productId);
    setError("");
    setNotice("");

    try {
      await dispatch(
        addItem({
          productId: item.productId,
          quantity: 1,
        })
      ).unwrap();

      setNotice(`${item.name} added to your cart.`);
    } catch (err) {
      console.error("Unable to add wishlist product to cart:", err);

      setError(
        typeof err === "string"
          ? err
          : "Couldn't add this product to your cart. Please try again."
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f19] text-white">
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-500/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-500/[0.10] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                <Heart className="h-3.5 w-3.5" />
                Your collection
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                My Wishlist<span className="text-rose-400">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Keep the products you love in one place and find them
                whenever you're ready.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                <Heart className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {loading ? "—" : items.length}
                </p>
                <p className="text-xs text-slate-400">Saved products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {notice && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300"
          >
            <Check className="h-4 w-4 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.08] p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadWishlist()}
              className="w-fit rounded-lg border border-rose-300/20 px-4 py-2 font-semibold transition hover:bg-rose-500/10"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-rose-400" />
            <p className="text-sm text-slate-400">
              Loading your saved products...
            </p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-500" />
            <h2 className="mt-4 text-xl font-semibold">
              Wishlist unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Please check your login and connection, then try loading your
              wishlist again.
            </p>
            <button
              type="button"
              onClick={() => void loadWishlist()}
              className="mt-6 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
            >
              Reload wishlist
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-rose-500/[0.08] blur-[70px]" />

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-400/15 bg-rose-500/[0.08] text-rose-300">
              <Heart className="h-9 w-9" />
            </div>

            <h2 className="relative mt-6 text-2xl font-bold">
              Your wishlist is waiting
            </h2>

            <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              You haven't saved any products yet. Explore the collection and
              tap the heart on products you want to keep.
            </p>

            <Link
              to="/products"
              className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Saved for later</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your favourites, all in one place.
                </p>
              </div>

              <Link
                to="/products"
                className="hidden items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200 sm:inline-flex"
              >
                Browse more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const outOfStock = item.stockQuantity <= 0;
                const removing = removingId === item.productId;
                const adding = addingId === item.productId;

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#101827] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-[#121c2d]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-500/[0.08] text-rose-300">
                        <Heart className="h-5 w-5 fill-current" />
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleRemove(item.productId)}
                        disabled={removingId !== null || addingId !== null}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removing ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-5 flex-1">
                      <h3 className="text-lg font-semibold leading-7 text-white">
                        {item.name}
                      </h3>

                      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">
                        {item.description ||
                          "A product saved to your wishlist."}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xl font-bold tracking-tight">
                            {formatPrice(item.price)}
                          </p>

                          <p
                            className={`mt-1 text-xs font-medium ${
                              outOfStock
                                ? "text-rose-300"
                                : "text-emerald-300"
                            }`}
                          >
                            {outOfStock
                              ? "Currently out of stock"
                              : `${item.stockQuantity} available`}
                          </p>
                        </div>

                        <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                          Saved item
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        to={`/products/${item.productId}`}
                        className="inline-flex items-center justify-center rounded-xl border border-white/[0.10] px-3 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.05]"
                      >
                        View details
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleAddToCart(item)}
                        disabled={
                          outOfStock ||
                          addingId !== null ||
                          removingId !== null
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {adding ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}

                        {adding
                          ? "Adding..."
                          : outOfStock
                            ? "Out of stock"
                            : "Add to cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.05]"
              >
                Browse more products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
