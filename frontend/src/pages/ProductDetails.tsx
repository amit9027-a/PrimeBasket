import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  RotateCcw,
  Star,
  PackageCheck,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";
import { useAppDispatch } from "../hooks";
import { addItem } from "../features/cart/cartThunks";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  stock?: number | null;
  stockQuantity?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const fallbackImages: { keywords: string[]; url: string }[] = [
  {
    keywords: ["headphone", "earphone", "earbud", "headset"],
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    keywords: ["shoe", "sneaker", "footwear"],
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
  },
  {
    keywords: ["watch"],
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
  },
  {
    keywords: ["bag", "backpack", "handbag"],
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    keywords: ["shirt", "t-shirt", "jacket", "clothing"],
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
  },
];

const getFallbackImage = (product?: Product) => {
  const searchableText =
    `${product?.name ?? ""} ${product?.category ?? product?.categoryName ?? ""}`.toLowerCase();

  const match = fallbackImages.find((item) =>
    item.keywords.some((keyword) => searchableText.includes(keyword)),
  );

  return (
    match?.url ??
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85"
  );
};

const getProductImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl?.trim()) return null;

  const value = imageUrl.trim();

  if (/^(https?:\/\/|data:image\/|blob:)/i.test(value)) {
    return value;
  }

  const baseURL = api.defaults.baseURL || "http://localhost:8080/api/v1";
  const serverOrigin = baseURL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");

  if (value.startsWith("/")) {
    return `${serverOrigin}${value}`;
  }

  return `${serverOrigin}/${value}`;
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setImageFailed(false);
      setQuantity(1);
      setAdded(false);
      setCartError("");

      try {
        const response = await api.get<Product[]>("/products");

        if (!active) return;

        const found = response.data.find(
          (item) => String(item.id) === String(id),
        );

        if (!found) {
          setError("This product could not be found.");
        } else {
          setProduct(found);
        }
      } catch {
        if (active) {
          setError("We couldn't load this product. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const availableStock = product
    ? product.stockQuantity ?? product.stock
    : undefined;

  const inStock = availableStock == null || availableStock > 0;

  const category = product?.categoryName ?? product?.category;

  const imageUrl = getProductImageUrl(product?.imageUrl);
  const displayedImage =
    !imageFailed && imageUrl
      ? imageUrl
      : getFallbackImage(product ?? undefined);

  const handleAddToCart = async () => {
    if (!product || adding || !inStock) return;

    setAdding(true);
    setCartError("");
    setAdded(false);

    try {
      await dispatch(
        addItem({
          productId: product.id,
          quantity,
        }),
      ).unwrap();

      setAdded(true);
      window.setTimeout(() => setAdded(false), 2500);
    } catch {
      setCartError(
        "Couldn't add this product. Please sign in and try again.",
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0f19] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-4 w-48 rounded bg-white/10" />

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded-3xl border border-white/5 bg-[#101827]" />

            <div className="space-y-5 py-6">
              <div className="h-5 w-32 rounded bg-blue-400/15" />
              <div className="h-12 w-4/5 rounded bg-white/10" />
              <div className="h-5 w-2/3 rounded bg-white/5" />
              <div className="h-10 w-40 rounded bg-white/10" />
              <div className="h-14 w-full rounded-2xl bg-blue-500/20" />
              <div className="h-14 w-full rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0f19] px-5 py-16 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[#111a29] text-blue-400">
            <ShoppingBag size={34} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            Aestro Mart
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Product unavailable
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {error || "This product is not available right now."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111a29] px-5 py-3 text-sm font-semibold transition hover:border-blue-400/40 hover:bg-[#172338]"
            >
              <RefreshCw size={16} />
              Try again
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              <ArrowLeft size={17} />
              Back to shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0f19] text-white">
      {/* Announcement bar */}
      <div className="border-b border-white/[0.06] bg-[#0d1421] px-4 py-3 text-center text-[11px] font-medium tracking-wide text-slate-300 sm:text-xs">
        <span className="font-extrabold tracking-[0.2em] text-blue-400">
          Prime Basket
        </span>
        <span className="mx-2 text-white/20">•</span>
        Quality products. A smarter way to shop.
        <span className="mx-2 hidden text-white/20 sm:inline">•</span>
        <span className="hidden text-slate-400 sm:inline">
          Convenient shopping, delivered to you
        </span>
      </div>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <Link to="/" className="transition hover:text-blue-400">
            Home
          </Link>

          <ChevronRight size={14} />

          <Link to="/products" className="transition hover:text-blue-400">
            Products
          </Link>

          <ChevronRight size={14} />

          <span className="max-w-[200px] truncate font-medium text-slate-200">
            {product.name}
          </span>
        </nav>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to all products
        </button>
      </div>

      {/* Main product content */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pb-24">
        <div className="grid items-start gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
          {/* Product image */}
          <div>
            <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101827] p-5 sm:rounded-[32px] sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/[0.12] blur-[90px]" />

              <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-500/[0.10] blur-[90px]" />

              <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300 backdrop-blur-md sm:left-6 sm:top-6 sm:text-xs">
                <Sparkles size={14} />
                Featured product
              </div>

              <button
                type="button"
                aria-label={
                  favorite ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={favorite}
                onClick={() => setFavorite((current) => !current)}
                className={`absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition hover:scale-105 sm:right-6 sm:top-6 ${
                  favorite
                    ? "border-red-400/30 bg-red-400/10 text-red-400"
                    : "border-white/10 bg-[#0a0f19]/70 text-slate-300 hover:border-blue-400/40 hover:text-blue-400"
                }`}
              >
                <Heart
                  size={19}
                  fill={favorite ? "currentColor" : "none"}
                />
              </button>

              <img
                key={displayedImage}
                src={displayedImage}
                alt={product.name}
                onError={() => {
                  if (!imageFailed) setImageFailed(true);
                }}
                className="relative z-[1] h-full w-full max-h-[590px] object-contain transition duration-500 group-hover:scale-[1.035]"
              />

              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-[#0a0f19]/85 px-4 py-3 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6 sm:px-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Prime Basket
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    Your next favourite find
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
                  <ShoppingBag size={19} />
                </div>
              </div>
            </div>

            {/* Product benefits */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure shopping" },
                { icon: Truck, label: "Easy delivery" },
                { icon: RotateCcw, label: "Customer support" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-[#101827] px-2 py-4 text-center transition hover:border-blue-400/20 sm:flex-row sm:justify-center sm:gap-2 sm:px-3"
                >
                  <Icon size={18} className="shrink-0 text-blue-400" />

                  <span className="text-[10px] font-semibold text-slate-300 sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product information */}
          <div className="pt-1 lg:pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300 sm:text-xs">
                {category || "Everyday essential"}
              </span>

              <span
                className={`inline-flex items-center gap-2 text-xs font-semibold ${
                  inStock ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    inStock ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />

                {inStock ? "Available" : "Out of stock"}
              </span>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              <Zap size={14} className="text-blue-400" />
              Selected for your everyday needs
            </p>

            <h1 className="mt-3 break-words text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-white sm:text-4xl lg:text-[46px]">
              {product.name}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              {product.description ||
                "Discover everyday convenience with this carefully selected product from Aestro Mart."}
            </p>

            {(product.rating != null || product.reviewCount != null) && (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/15 bg-amber-400/[0.07] px-2.5 py-1.5 text-amber-400">
                  <Star size={15} fill="currentColor" />

                  <span className="font-bold">
                    {product.rating != null
                      ? product.rating.toFixed(1)
                      : "New"}
                  </span>
                </div>

                {product.reviewCount != null && (
                  <span className="text-xs text-slate-500">
                    {product.reviewCount} reviews
                  </span>
                )}
              </div>
            )}

            <div className="my-7 border-t border-white/[0.08]" />

            {/* Price */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Price
                </p>

                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Inclusive of applicable taxes
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold text-emerald-400">
                <Check size={15} />
                Quality selection
              </div>
            </div>

            <div className="my-7 border-t border-white/[0.08]" />

            {/* Quantity selector */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">
                  Quantity
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Choose how many you need
                </p>
              </div>

              <div className="flex h-12 items-center rounded-xl border border-white/10 bg-[#101827]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-full w-12 items-center justify-center text-slate-300 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-8 text-center text-sm font-bold text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    availableStock != null && quantity >= availableStock
                  }
                  onClick={() =>
                    setQuantity((current) =>
                      availableStock == null
                        ? current + 1
                        : Math.min(availableStock, current + 1),
                    )
                  }
                  className="flex h-full w-12 items-center justify-center text-slate-300 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#101827] px-4 py-3.5">
              <span className="text-xs font-medium text-slate-400">
                Order subtotal
              </span>

              <span className="text-lg font-bold text-white">
                {formatPrice(product.price * quantity)}
              </span>
            </div>

            {/* Cart error */}
            {cartError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm leading-6 text-red-300"
              >
                {cartError}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                disabled={!inStock || adding}
                onClick={handleAddToCart}
                className="group flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(59,130,246,0.16)] transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding to cart...
                  </>
                ) : added ? (
                  <>
                    <Check size={19} />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={19} />
                    Add to cart
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#101827] px-6 py-4 text-sm font-bold text-white transition hover:border-blue-400/40 hover:bg-[#152136]"
              >
                View cart
              </Link>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500 sm:text-left">
              Secure shopping · Convenient checkout · Friendly support
            </p>

            {/* Service information */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101827]">
              <div className="flex items-center gap-4 border-b border-white/[0.07] px-4 py-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.08] text-blue-400">
                  <Truck size={19} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Convenient delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Delivery details are available during checkout.
                  </p>
                </div>

                <ChevronRight size={17} className="text-slate-600" />
              </div>

              <div className="flex items-center gap-4 border-b border-white/[0.07] px-4 py-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.08] text-blue-400">
                  <ShieldCheck size={19} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Secure checkout
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Review your order before confirming your purchase.
                  </p>
                </div>

                <ChevronRight size={17} className="text-slate-600" />
              </div>

              <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.08] text-blue-400">
                  <PackageCheck size={19} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Support when you need it
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Get assistance with your shopping experience.
                  </p>
                </div>

                <ChevronRight size={17} className="text-slate-600" />
              </div>
            </div>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-blue-400"
            >
              <ArrowLeft size={16} />
              Continue exploring products
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom trust strip */}
      <section className="border-t border-white/[0.07] bg-[#0d1421]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            {
              icon: ShieldCheck,
              title: "Shop with confidence",
              description: "A simple, convenient shopping experience.",
            },
            {
              icon: Truck,
              title: "Delivery information",
              description: "Check delivery details at checkout.",
            },
            {
              icon: PackageCheck,
              title: "Order management",
              description: "Keep track of your orders in one place.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.08] text-blue-400">
                <Icon size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}