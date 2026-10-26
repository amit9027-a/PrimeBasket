
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";

import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks";
import { addItem } from "@/features/cart/cartThunks";

type ProductImage = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  description?: string;
  categoryName?: string;
  images?: ProductImage[];
};

type WishlistItem = {
  id: number;
  productId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  savedAt?: string;
};

type SortOption = "relevance" | "price-low" | "price-high" | "name";

const fallbackImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1542291026-7eec264c27b0?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const getProductImage = (product: Product, index = 0) => {
  const primary = product.images?.find((image) => image.primaryImage);

  return (
    primary?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    fallbackImages[Math.abs(product.id + index) % fallbackImages.length]
  );
};

const getSortLabel = (sort: SortOption) => {
  switch (sort) {
    case "price-low":
      return "Price: Low to High";
    case "price-high":
      return "Price: High to Low";
    case "name":
      return "Name: A to Z";
    default:
      return "Recommended";
  }
};

const Products = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Wishlist state comes from the backend, not temporary local state.
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistBusyIds, setWishlistBusyIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  // Load catalogue.
  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<Product[]>("/products");

        if (active) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Unable to load products:", err);

        if (active) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Load the logged-in user's saved wishlist from the backend.
  useEffect(() => {
    let active = true;

    const loadWishlist = async () => {
      if (!user) {
        setLikedProducts([]);
        setWishlistLoading(false);
        return;
      }

      try {
        setWishlistLoading(true);

        const response = await api.get<WishlistItem[]>("/wishlist");

        if (!active) return;

        const items = Array.isArray(response.data) ? response.data : [];

        setLikedProducts(
          items
            .map((item) => Number(item.productId))
            .filter((id) => Number.isFinite(id) && id > 0),
        );
      } catch (err) {
        console.error("Unable to load wishlist:", err);

        if (active) {
          setFeedback("Wishlist couldn't load. Please refresh and try again.");
        }
      } finally {
        if (active) {
          setWishlistLoading(false);
        }
      }
    };

    void loadWishlist();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");

    setSearch(query ?? "");
    setCurrentPage(1);
  }, [location.search]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => product.categoryName?.trim())
          .filter((category): category is string => Boolean(category)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.categoryName ?? "").toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" ||
        product.categoryName === activeCategory;

      return matchesSearch && matchesCategory;
    });

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, search, activeCategory, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const availableProducts = products.filter(
    (product) => product.stockQuantity > 0,
  ).length;

  const hasFilters =
    search.trim() !== "" ||
    activeCategory !== "All" ||
    sort !== "relevance";

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products",
    );
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (product.stockQuantity <= 0 || addingId !== null) {
      return;
    }

    setAddingId(product.id);
    setFeedback("");

    try {
      await dispatch(
        addItem({
          productId: product.id,
          quantity: 1,
        }),
      ).unwrap();

      setFeedback(`${product.name} added to your cart.`);
    } catch (err) {
      console.error("Unable to add product to cart:", err);

      setFeedback(
        typeof err === "string"
          ? err
          : "Could not add the product. Please try again.",
      );
    } finally {
      setAddingId(null);
      window.setTimeout(() => setFeedback(""), 3500);
    }
  };

  // Add/remove through the existing backend API.
  const toggleWishlist = async (productId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoading || wishlistBusyIds.includes(productId)) {
      return;
    }

    const wasLiked = likedProducts.includes(productId);

    setWishlistBusyIds((current) =>
      current.includes(productId) ? current : [...current, productId],
    );
    setFeedback("");

    try {
      if (wasLiked) {
        await api.delete(`/wishlist/${productId}`);

        setLikedProducts((current) =>
          current.filter((id) => id !== productId),
        );

        setFeedback("Product removed from your wishlist.");
      } else {
        await api.post(`/wishlist/${productId}`);

        setLikedProducts((current) =>
          current.includes(productId) ? current : [...current, productId],
        );

        setFeedback("Product saved to your wishlist.");
      }
    } catch (err) {
      console.error("Unable to update wishlist:", err);

      setFeedback(
        "Wishlist update failed. Please check your login and try again.",
      );
    } finally {
      setWishlistBusyIds((current) =>
        current.filter((id) => id !== productId),
      );
      window.setTimeout(() => setFeedback(""), 3500);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSort("relevance");
    setCurrentPage(1);
    navigate("/products", { replace: true });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0f19] text-slate-100">
      <div className="border-b border-blue-400/15 bg-[#101b30] px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.13em] text-blue-200 sm:text-xs">
        <span className="inline-flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          DISCOVER MORE. FIND YOUR NEXT FAVOURITE.
          <Zap className="h-3.5 w-3.5 text-blue-400" />
        </span>
      </div>

      <section className="px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="PrimeBasket-container mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[25px] border border-white/10 bg-[#111b2c] px-6 py-9 shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:rounded-[30px] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/15 blur-[90px]" />
            <div className="absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-[90px]" />

            <div className="grid items-center gap-9 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-blue-200 sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  THE PRIMEBASKET COLLECTION
                </span>

                <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                  Find your next
                  <span className="block bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    favourite thing.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                  From everyday essentials to exciting discoveries, explore
                  products that make your shopping experience feel effortless.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#product-catalogue"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-400"
                  >
                    Explore products
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link
                    to="/"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10"
                  >
                    Back to home
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-blue-300" />
                    {products.length} products listed
                  </span>
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-300" />
                    {categories.length - 1} categories
                  </span>
                </div>
              </div>

              <div className="hidden justify-end lg:flex">
                <div className="relative w-full max-w-[310px] rounded-[28px] border border-white/10 bg-[#0b1423]/80 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-400">
                      YOUR NEXT GREAT FIND
                    </span>
                    <Sparkles className="h-5 w-5 text-blue-300" />
                  </div>

                  <div className="my-5 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/10 bg-gradient-to-br from-blue-500/15 via-[#14223a] to-indigo-500/10">
                    <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border border-blue-300/20 bg-blue-400/10 shadow-[0_0_60px_rgba(59,130,246,0.12)]">
                      <ShoppingBag className="h-16 w-16 stroke-[1.2] text-blue-300" />
                    </div>
                  </div>

                  <p className="text-2xl font-black text-white">Good finds.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Useful essentials. New discoveries. All in one place.
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs font-semibold text-blue-200">
                    <Star className="h-4 w-4 fill-blue-300 text-blue-300" />
                    Discover your everyday favourites
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-6 sm:mt-11 sm:gap-6 sm:pt-7">
              <HeroStat value={String(products.length)} label="Products" />
              <HeroStat
                value={String(categories.length - 1)}
                label="Categories"
              />
              <HeroStat
                value={String(availableProducts)}
                label="Available now"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-y border-white/[0.07] bg-[#0c121f]/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="PrimeBasket-container mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <form
              onSubmit={handleSearch}
              className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#111a2a] px-4 transition focus-within:border-blue-400/50 focus-within:ring-4 focus-within:ring-blue-500/10"
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, categories..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    navigate("/products", { replace: true });
                  }}
                  aria-label="Clear search"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-400"
              >
                Search
              </button>
            </form>

            <div className="flex gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111a2a] px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30"
              >
                <SlidersHorizontal className="h-4 w-4 text-blue-300" />
                Categories
              </button>

              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111a2a] px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30"
              >
                <ChevronDown className="h-4 w-4 text-blue-300" />
                Sort
              </button>
            </div>

            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-[#111a2a] px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30"
              >
                <span className="text-blue-300">Sort:</span>
                {getSortLabel(sort)}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {sortOpen && (
              <SortMenu
                sort={sort}
                onChange={(value) => {
                  setSort(value);
                  setSortOpen(false);
                }}
              />
            )}
          </div>

          <div className="mt-4 hidden items-center gap-2 overflow-x-auto pb-1 lg:flex">
            <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Categories
            </span>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeCategory === category
                    ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                    : "border-white/[0.08] bg-white/[0.025] text-slate-400 hover:border-blue-400/30 hover:text-blue-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="product-catalogue"
        className="px-4 py-9 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="PrimeBasket-container mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
                <span className="h-1.5 w-5 rounded-full bg-blue-400" />
                THE COLLECTION
              </p>

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Explore products<span className="text-blue-400">.</span>
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Find something useful, exciting or uniquely yours.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/wishlist"
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                <Heart className="h-4 w-4" />
                Wishlist
                <span className="rounded-full bg-rose-400/15 px-2 py-0.5">
                  {likedProducts.length}
                </span>
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#101827] px-4 py-2.5 text-xs font-semibold text-slate-300">
                <ShoppingBag className="h-4 w-4 text-blue-300" />
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} results`}
              </span>
            </div>
          </div>

          {hasFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Filters:</span>

              {search.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    navigate("/products", { replace: true });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200"
                >
                  {search}
                  <X className="h-3 w-3" />
                </button>
              )}

              {activeCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("All")}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200"
                >
                  {activeCategory}
                  <X className="h-3 w-3" />
                </button>
              )}

              {sort !== "relevance" && (
                <button
                  type="button"
                  onClick={() => setSort("relevance")}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200"
                >
                  {getSortLabel(sort)}
                  <X className="h-3 w-3" />
                </button>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-semibold text-slate-400 underline underline-offset-4 transition hover:text-blue-300"
              >
                Clear all
              </button>
            </div>
          )}

          {wishlistLoading && user && (
            <p className="mb-4 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Syncing your wishlist...
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[24px] border border-white/10 bg-[#101827] px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                <RefreshCw className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                Products couldn't load
              </h3>

              <p className="mt-2 text-sm text-slate-400">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-white/15 bg-[#101827] px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                <Search className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                Nothing found this time.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Try a different search term or reset your filters to explore
                the complete collection.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              >
                Show all products
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {paginatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    image={getProductImage(
                      product,
                      (currentPage - 1) * productsPerPage + index,
                    )}
                    liked={likedProducts.includes(product.id)}
                    wishlistBusy={wishlistBusyIds.includes(product.id)}
                    adding={addingId === product.id}
                    onWishlist={() => void toggleWishlist(product.id)}
                    onAdd={() => void handleAddToCart(product)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    aria-label="Previous page"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101827] text-slate-300 transition hover:border-blue-400/30 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .map((page, index, visiblePages) => (
                      <span key={page} className="contents">
                        {index > 0 &&
                          page - visiblePages[index - 1] > 1 && (
                            <span className="px-1 text-slate-500">...</span>
                          )}

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            document
                              .getElementById("product-catalogue")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                            currentPage === page
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-950/30"
                              : "border border-white/10 bg-[#101827] text-slate-300 hover:border-blue-400/30 hover:text-blue-300"
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1),
                      )
                    }
                    aria-label="Next page"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101827] text-slate-300 transition hover:border-blue-400/30 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-slate-500">
                Showing {(currentPage - 1) * productsPerPage + 1}–
                {Math.min(
                  currentPage * productsPerPage,
                  filteredProducts.length,
                )}{" "}
                of {filteredProducts.length} products
              </p>
            </>
          )}
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#0d1421] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="PrimeBasket-container mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          <TrustItem
            icon={<PackageCheck className="h-5 w-5" />}
            title="Discover with ease"
            description="Browse products and categories in one place."
          />
          <TrustItem
            icon={<Truck className="h-5 w-5" />}
            title="Convenient shopping"
            description="Choose your favourites and add them to your cart."
          />
          <TrustItem
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Made for everyday"
            description="Explore useful essentials and new discoveries."
          />
        </div>
      </section>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[26px] border-t border-white/10 bg-[#0d1421] p-5 shadow-2xl sm:left-auto sm:top-0 sm:max-h-none sm:w-[390px] sm:rounded-none sm:rounded-l-[26px] sm:border-l sm:border-t-0 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Categories</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Choose what you want to explore.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close category filters"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    activeCategory === category
                      ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                      : "border-white/10 bg-[#101827] text-slate-300 hover:border-blue-400/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-slate-500">
                Sort products
              </h4>

              <div className="space-y-2">
                {(
                  [
                    ["relevance", "Recommended"],
                    ["price-low", "Price: Low to High"],
                    ["price-high", "Price: High to Low"],
                    ["name", "Name: A to Z"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSort(value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      sort === value
                        ? "border-blue-400/30 bg-blue-500/10 text-blue-200"
                        : "border-white/10 bg-[#101827] text-slate-300"
                    }`}
                  >
                    {label}
                    {sort === value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex gap-3 border-t border-white/[0.08] pt-5">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-xl border border-white/10 bg-[#101827] px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-blue-400/30"
              >
                Reset filters
              </button>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              >
                Show {filteredProducts.length} results
              </button>
            </div>
          </aside>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="fixed bottom-5 left-4 right-4 z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-[#111b2c] p-4 shadow-2xl shadow-black/40 sm:left-auto sm:right-6"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
            {feedback.toLowerCase().includes("added") ||
            feedback.toLowerCase().includes("saved") ||
            feedback.toLowerCase().includes("removed") ? (
              <Check className="h-5 w-5" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </div>

          <p className="min-w-0 flex-1 text-sm font-semibold text-slate-200">
            {feedback}
          </p>

          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Dismiss notification"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
};

const HeroStat = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => (
  <div className="min-w-0">
    <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
      {value}
      <span className="text-blue-400">+</span>
    </p>
    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{label}</p>
  </div>
);

const SortMenu = ({
  sort,
  onChange,
}: {
  sort: SortOption;
  onChange: (value: SortOption) => void;
}) => {
  const options: { value: SortOption; label: string }[] = [
    { value: "relevance", label: "Recommended" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
  ];

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#101827] p-1.5 shadow-2xl shadow-black/40">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-semibold transition ${
            sort === option.value
              ? "bg-blue-500/10 text-blue-200"
              : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          {option.label}
          {sort === option.value && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
};

const ProductCard = ({
  product,
  image,
  liked,
  wishlistBusy,
  adding,
  onWishlist,
  onAdd,
}: {
  product: Product;
  image: string;
  liked: boolean;
  wishlistBusy: boolean;
  adding: boolean;
  onWishlist: () => void;
  onAdd: () => void;
}) => {
  const outOfStock = product.stockQuantity <= 0;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111a29] transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.28)] sm:rounded-[22px]">
      <div className="relative aspect-square overflow-hidden bg-[#182337]">
        <Link
          to={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImages[0];
            }}
          />
        </Link>

        <span className="absolute left-2.5 top-2.5 max-w-[75%] truncate rounded-full border border-white/10 bg-[#0b1220]/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-200 backdrop-blur-md sm:left-3 sm:top-3 sm:px-3">
          {product.categoryName || "Discover"}
        </span>

        <button
          type="button"
          onClick={onWishlist}
          disabled={wishlistBusy}
          aria-label={
            wishlistBusy
              ? "Updating wishlist"
              : liked
                ? "Remove from wishlist"
                : "Add to wishlist"
          }
          aria-pressed={liked}
          className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 ${
            liked
              ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
              : "border-white/15 bg-[#0b1220]/80 text-slate-200 hover:border-rose-400/30 hover:text-rose-300"
          }`}
        >
          {wishlistBusy ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          )}
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#080d17]/65 backdrop-blur-[2px]">
            <span className="rounded-full border border-white/10 bg-[#111a29] px-4 py-2 text-xs font-bold text-slate-200">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <Star className="h-3 w-3 fill-blue-300 text-blue-300" />
          <span>Discover this find</span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-100 transition hover:text-blue-300"
        >
          {product.name}
        </Link>

        <p className="mt-1.5 line-clamp-2 min-h-8 text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
          {product.description?.trim() ||
            "A useful addition to your everyday collection."}
        </p>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Price
              </p>
              <p className="mt-1 break-words text-base font-black tracking-tight text-white sm:text-lg">
                {formatPrice(product.price)}
              </p>
            </div>

            <span
              className={`mb-1 shrink-0 text-[9px] font-semibold sm:text-[10px] ${
                outOfStock ? "text-rose-300" : "text-emerald-300"
              }`}
            >
              {outOfStock ? "Unavailable" : "In stock"}
            </span>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={adding || outOfStock}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 px-2 text-[11px] font-bold text-blue-200 transition hover:border-blue-400/30 hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-11 sm:text-xs"
          >
            {adding ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {adding ? "Adding..." : outOfStock ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
};

const TrustItem = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
      {icon}
    </div>

    <div>
      <h3 className="text-sm font-bold text-slate-100 sm:text-base">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111a29] sm:rounded-[22px]">
    <div className="aspect-square animate-pulse bg-[#1b2739]" />

    <div className="space-y-3 p-3 sm:p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-[#25334a]" />
      <div className="h-4 w-full animate-pulse rounded bg-[#25334a]" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-[#25334a]" />
      <div className="h-5 w-24 animate-pulse rounded bg-[#25334a]" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-[#25334a]" />
    </div>
  </div>
);

export default Products;