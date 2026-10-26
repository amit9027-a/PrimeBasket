import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  X,
  Zap,
} from "lucide-react";

import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { addItem } from "@/features/cart/cartThunks";
import { useAppDispatch } from "@/hooks";
import { formatPrice } from "@/utils/formatPrice";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
  stock?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
}

const PRODUCTS_PER_PAGE = 12;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80";

function getProductImage(product: Product) {
  return (
    product.imageUrl ||
    FALLBACK_IMAGE
  );
}

function getDiscount(price: number) {
  const discount = Math.round(8 + (price % 23));

  return Math.min(discount, 35);
}

function getOriginalPrice(price: number) {
  const discount = getDiscount(price);

  return Math.round(price / (1 - discount / 100));
}

function getRating(product: Product) {
  if (product.rating && product.rating > 0) {
    return Math.min(product.rating, 5);
  }

  return 4 + ((product.id % 10) / 10);
}

function getReviewCount(product: Product) {
  if (product.reviewCount && product.reviewCount > 0) {
    return product.reviewCount;
  }

  return 20 + product.id * 7;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />

      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" />
        <div className="h-7 w-2/5 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [sortBy, setSortBy] = useState<
    "relevance" | "price-low" | "price-high" | "name"
  >("relevance");

  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [wishlist, setWishlist] = useState<number[]>([]);

  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get("search") || "";

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<Product[]>("/products");

        if (!mounted) return;

        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load products:", err);

        if (mounted) {
          setError(
            "Products load nahi ho paaye. Please backend connection check karein."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();

    products.forEach((product) => {
      if (product.category?.trim()) {
        unique.add(product.category.trim());
      }
    });

    return ["All", ...Array.from(unique).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [products, search, selectedCategory, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearch = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(location.search);

    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    navigate(`/products?${params.toString()}`, {
      replace: true,
    });
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname + location.search,
        },
      });

      return;
    }

    try {
      setAddingProductId(productId);

      await dispatch(
        addItem({
          productId,
          quantity: 1,
        })
      ).unwrap();

      setAddedProductId(productId);

      window.setTimeout(() => {
        setAddedProductId((current) =>
          current === productId ? null : current
        );
      }, 1800);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingProductId(null);
    }
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortBy("relevance");

    navigate("/products", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Breadcrumb / Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="PrimeBasket-container py-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              to="/"
              className="transition hover:text-blue-600"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-800">
              Products
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Zap size={13} />
                Prime Basket Marketplace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Shop Everything You Need
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Discover products across multiple categories with great
                prices, trusted sellers and a simple shopping experience.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {filteredProducts.length}
              </span>
              products found
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="PrimeBasket-container py-6 sm:py-8">
        {/* Search + Mobile Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search products, categories and more..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 lg:hidden"
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>

              <div className="relative flex-1 lg:w-56 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | "relevance"
                        | "price-low"
                        | "price-high"
                        | "name"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-950">
                  Shop By Category
                </h2>
              </div>

              <div className="mt-4 space-y-1">
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  const count =
                    category === "All"
                      ? products.length
                      : products.filter(
                          (product) =>
                            product.category?.toLowerCase() ===
                            category.toLowerCase()
                        ).length;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                        active
                          ? "bg-blue-600 font-bold text-white shadow-sm"
                          : "font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <span className="truncate pr-2">
                        {category}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(search || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products */}
          <section className="min-w-0">
            {/* Active filters */}
            {(search || selectedCategory !== "All") && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold text-slate-500">
                  Active:
                </span>

                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                  >
                    Search: {search}
                    <X size={13} />
                  </button>
                )}

                {selectedCategory !== "All" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                  >
                    {selectedCategory}
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
                  <X size={24} />
                </div>

                <h2 className="mt-4 text-lg font-black text-slate-900">
                  Something went wrong
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={27} />
                  </div>

                  <h2 className="mt-5 text-xl font-black text-slate-950">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    We couldn't find products matching your current search
                    or category filter.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    View All Products
                  </button>
                </div>
              )}

            {/* Grid */}
            {!loading &&
              !error &&
              visibleProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                    {visibleProducts.map((product) => {
                      const discount = getDiscount(product.price);
                      const originalPrice = getOriginalPrice(product.price);
                      const rating = getRating(product);
                      const reviews = getReviewCount(product);

                      const isWishlisted = wishlist.includes(product.id);
                      const isAdding = addingProductId === product.id;
                      const isAdded = addedProductId === product.id;

                      return (
                        <article
                          key={product.id}
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-slate-100">
                            <Link to={`/products/${product.id}`}>
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                onError={(event) => {
                                  event.currentTarget.src =
                                    FALLBACK_IMAGE;
                                }}
                              />
                            </Link>

                            {/* Discount */}
                            <div className="absolute left-2.5 top-2.5 rounded-md bg-green-600 px-2 py-1 text-[11px] font-black text-white">
                              {discount}% OFF
                            </div>

                            {/* Wishlist */}
                            <button
                              type="button"
                              onClick={() =>
                                toggleWishlist(product.id)
                              }
                              aria-label="Add to wishlist"
                              className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border shadow-sm backdrop-blur transition ${
                                isWishlisted
                                  ? "border-red-200 bg-red-50 text-red-500"
                                  : "border-slate-200 bg-white/95 text-slate-600 hover:text-red-500"
                              }`}
                            >
                              <Heart
                                size={17}
                                fill={
                                  isWishlisted
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>

                            {/* Quick Add */}
                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(product.id)
                              }
                              disabled={
                                isAdding || isAdded
                              }
                              className={`absolute bottom-3 left-3 right-3 hidden h-10 items-center justify-center gap-2 rounded-lg text-sm font-black text-white shadow-lg transition sm:flex ${
                                isAdded
                                  ? "bg-green-600"
                                  : "bg-blue-600 hover:bg-blue-700"
                              } ${
                                isAdding
                                  ? "cursor-wait opacity-80"
                                  : ""
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={16} />
                                  Added to Cart
                                </>
                              ) : isAdding ? (
                                "Adding..."
                              ) : (
                                <>
                                  <ShoppingCart size={16} />
                                  Add to Cart
                                </>
                              )}
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-3.5 sm:p-4">
                            <Link
                              to={`/products/${product.id}`}
                              className="block"
                            >
                              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-600">
                                {product.category ||
                                  "General"}
                              </div>

                              <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-blue-600 sm:text-[15px]">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Rating */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                {rating.toFixed(1)}
                                <Star
                                  size={10}
                                  fill="currentColor"
                                />
                              </span>

                              <span className="text-[11px] text-slate-400">
                                {reviews.toLocaleString()} reviews
                              </span>
                            </div>

                            {/* Price */}
                            <div className="mt-3 flex flex-wrap items-baseline gap-2">
                              <span className="text-lg font-black text-slate-950 sm:text-xl">
                                {formatPrice(product.price)}
                              </span>

                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                            </div>

                            {/* Stock */}
                            <div className="mt-2">
                              {product.stock !== undefined &&
                              product.stock !== null ? (
                                product.stock > 0 ? (
                                  <span className="text-[11px] font-semibold text-green-600">
                                    In stock
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-red-500">
                                    Out of stock
                                  </span>
                                )
                              ) : (
                                <span className="text-[11px] font-semibold text-green-600">
                                  Available
                                </span>
                              )}
                            </div>

                            {/* Mobile Add */}
                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(product.id)
                              }
                              disabled={
                                isAdding || isAdded
                              }
                              className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-black text-white transition sm:hidden ${
                                isAdded
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={15} />
                                  Added
                                </>
                              ) : isAdding ? (
                                "Adding..."
                              ) : (
                                <>
                                  <ShoppingCart size={15} />
                                  Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                          setPage((current) =>
                            Math.max(1, current - 1)
                          )
                        }
                        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      )
                        .slice(
                          Math.max(0, page - 3),
                          Math.min(totalPages, page + 2)
                        )
                        .map((pageNumber) => (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() =>
                              setPage(pageNumber)
                            }
                            className={`grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-bold transition ${
                              page === pageNumber
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ))}

                      <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() =>
                          setPage((current) =>
                            Math.min(
                              totalPages,
                              current + 1
                            )
                          )
                        }
                        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
          </section>
        </div>
      </main>

      {/* Trust Strip */}
      <section className="border-t border-slate-200 bg-white">
        <div className="PrimeBasket-container grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
              <ShoppingCart size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Easy Shopping
              </p>
              <p className="text-xs text-slate-500">
                Simple & secure checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-50 text-green-600">
              <Check size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Trusted Products
              </p>
              <p className="text-xs text-slate-500">
                Quality marketplace selection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600">
              <Zap size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Great Deals
              </p>
              <p className="text-xs text-slate-500">
                Competitive everyday prices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-purple-50 text-purple-600">
              <Star size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Customer First
              </p>
              <p className="text-xs text-slate-500">
                Built for a better experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-slate-950/50"
          />

          <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Filters
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a category
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(false)
                }
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMobileFilters(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm ${
                      active
                        ? "bg-blue-600 font-bold text-white"
                        : "bg-slate-50 font-medium text-slate-700"
                    }`}
                  >
                    <span>{category}</span>

                    {active && <Check size={17} />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                clearFilters();
                setShowMobileFilters(false);
              }}
              className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
            >
              Clear All Filters
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}