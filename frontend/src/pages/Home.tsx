
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks";
import { addItem } from "@/features/cart/cartThunks";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/features/wishlist/wishlistAPI";

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

const fallbackImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1542291026-7eec264c27b0?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
];

const categories = [
  { name: "Mobiles", icon: "📱", query: "mobile" },
  { name: "Electronics", icon: "🎧", query: "electronics" },
  { name: "Fashion", icon: "👕", query: "fashion" },
  { name: "Home & Living", icon: "🏡", query: "home" },
  { name: "Beauty", icon: "✨", query: "beauty" },
  { name: "Grocery", icon: "🛒", query: "grocery" },
  { name: "Sports", icon: "⚽", query: "sports" },
  { name: "Accessories", icon: "⌚", query: "accessories" },
];

const heroSlides = [
  {
    eyebrow: "THE SMARTER WAY TO SHOP",
    title: "Good finds.",
    highlight: "Great everyday prices.",
    description:
      "Discover products you'll love, explore new favourites and make everyday shopping feel effortless.",
    button: "Explore products",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  },
  {
    eyebrow: "YOUR NEXT FAVOURITE IS HERE",
    title: "A little more",
    highlight: "joy in every find.",
    description:
      "From useful essentials to exciting new discoveries, find more of what makes your day better.",
    button: "Discover more",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85",
  },
  {
    eyebrow: "EVERYDAY ESSENTIALS, REIMAGINED",
    title: "Shop your way.",
    highlight: "Love what you find.",
    description:
      "Browse a growing collection of products in one simple, welcoming shopping destination.",
    button: "Start exploring",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=85",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const getProductImage = (product: Product, index = 0) => {
  const primaryImage = product.images?.find((image) => image.primaryImage);

  return (
    primaryImage?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    fallbackImages[Math.abs(product.id + index) % fallbackImages.length]
  );
};

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Wishlist states
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState<number | null>(
    null
  );

  const [productScroll, setProductScroll] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Load products
  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);

        const response = await api.get<Product[]>("/products");

        if (active) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Unable to load products:", error);

        if (active) {
          setProducts([]);
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

  // Load saved wishlist from the backend
  useEffect(() => {
    let active = true;

    const loadWishlist = async () => {
      if (!user) {
        setLikedProducts([]);
        return;
      }

      try {
        const items = await getWishlist();

        if (active) {
          setLikedProducts(items.map((item) => item.productId));
        }
      } catch (error) {
        console.error("Unable to load wishlist:", error);
      }
    };

    void loadWishlist();

    return () => {
      active = false;
    };
  }, [user]);

  // Hero slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const displayProducts = useMemo(
    () => products.filter((product) => product.stockQuantity > 0),
    [products]
  );

  const dealProducts = displayProducts.slice(0, 10);
  const trendingProducts = displayProducts.slice(3, 11);
  const currentHero = heroSlides[heroIndex];

  // Search
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();

    navigate(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products"
    );
  };

  // Add to cart — existing functionality preserved
  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAddingId(productId);

      await dispatch(
        addItem({
          productId,
          quantity: 1,
        })
      ).unwrap();
    } catch (error) {
      console.error("Unable to add product to cart:", error);
      window.alert("Product cart mein add nahi hua. Please dobara try karo.");
    } finally {
      setAddingId(null);
    }
  };

  // Add/remove wishlist item and update the Navbar badge
  const toggleWishlist = async (productId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoadingId !== null) {
      return;
    }

    const alreadyLiked = likedProducts.includes(productId);

    try {
      setWishlistLoadingId(productId);

      if (alreadyLiked) {
        await removeFromWishlist(productId);

        setLikedProducts((current) =>
          current.filter((id) => id !== productId)
        );
      } else {
        await addToWishlist(productId);

        setLikedProducts((current) =>
          current.includes(productId) ? current : [...current, productId]
        );
      }

      // Navbar ko wishlist count refresh karne ke liye notify karo
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("Unable to update wishlist:", error);

      window.alert(
        "Wishlist update nahi hui. Login check karo aur dobara try karo."
      );
    } finally {
      setWishlistLoadingId(null);
    }
  };

  // Product carousel
  const scrollProducts = (direction: "left" | "right") => {
    const container = document.getElementById("deals-products-track");

    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>("article");
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 235;
    const gap = 16;

    const maxScroll = Math.max(
      0,
      container.scrollWidth -
        (container.parentElement?.clientWidth ?? container.clientWidth)
    );

    setProductScroll((current) => {
      const next =
        direction === "left"
          ? Math.min(current + (cardWidth + gap) * 2, 0)
          : Math.max(current - (cardWidth + gap) * 2, -maxScroll);

      return next;
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0f19] text-slate-100">
      {/* Announcement */}
      <div className="border-b border-blue-400/15 bg-[#101b30] px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.13em] text-blue-200 sm:text-xs">
        <span className="inline-flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          A BETTER WAY TO DISCOVER YOUR EVERYDAY ESSENTIALS
          <ArrowDownRight className="h-3.5 w-3.5 text-blue-400" />
        </span>
      </div>

      {/* Search */}
      <section className="border-b border-white/[0.07] bg-[#0c121f]">
        <div className="PrimeBasket-container py-5 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">
                YOUR EVERYDAY MARKETPLACE
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                Find your next favourite.
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Discover something worth bringing home.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex h-12 w-full items-center gap-3 rounded-xl border border-white/10 bg-[#111a2a] px-4 transition focus-within:border-blue-400/60 focus-within:ring-4 focus-within:ring-blue-500/10 sm:max-w-md"
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products, categories..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                aria-label="Search products"
              />

              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-400"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category shortcuts */}
      <section className="border-b border-white/[0.07] bg-[#0c121f]">
        <div className="PrimeBasket-container">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-3.5">
            <Link
              to="/products"
              className="flex shrink-0 items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-blue-500/25"
            >
              <ShoppingBag className="h-4 w-4" />
              All products
            </Link>

            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?search=${encodeURIComponent(category.query)}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-200"
              >
                <span>{category.icon}</span>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero slider */}
      <section className="py-5 sm:py-7 lg:py-9">
        <div className="PrimeBasket-container">
          <div className="relative isolate overflow-hidden rounded-[24px] border border-white/10 bg-[#111b2c] shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:rounded-[30px]">
            <img
              key={currentHero.image}
              src={currentHero.image}
              alt="Discover products at Prime Basket"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />

            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080d17]/95 via-[#0c1525]/85 to-[#0c1525]/35" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080d17]/45 to-transparent" />

            <div className="relative grid min-h-[430px] items-center gap-8 px-6 py-12 sm:px-10 md:min-h-[475px] md:px-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-16">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-blue-100 backdrop-blur-md sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                  {currentHero.eyebrow}
                </div>

                <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {currentHero.title}
                  <br />
                  <span className="bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    {currentHero.highlight}
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                  {currentHero.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/products"
                    className="group inline-flex h-12 items-center gap-3 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-400"
                  >
                    {currentHero.button}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/products"
                    className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-bold text-slate-100 backdrop-blur-md transition hover:border-blue-300/30 hover:bg-white/10"
                  >
                    Browse collection
                  </Link>
                </div>

                <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-300" />
                    Secure shopping
                  </span>
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-300" />
                    Convenient delivery
                  </span>
                </div>
              </div>

              <div className="hidden justify-end lg:flex">
                <div className="w-full max-w-[300px] rounded-[25px] border border-white/15 bg-[#0d1728]/75 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-slate-300">
                      THE PRIMEBASKET EDIT
                    </span>
                    <Sparkles className="h-5 w-5 text-blue-300" />
                  </div>

                  <div className="my-5 flex h-32 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-blue-500/15 to-indigo-500/5">
                    <ShoppingBag className="h-16 w-16 stroke-[1.1] text-blue-300" />
                  </div>

                  <p className="text-2xl font-black">Discover more.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Useful essentials. Thoughtful finds. A simpler way to shop.
                  </p>

                  <Link
                    to="/products"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-white"
                  >
                    Explore the store <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Slider controls */}
              <div className="absolute bottom-5 right-5 flex items-center gap-2 sm:bottom-7 sm:right-8">
                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex(
                      (heroIndex - 1 + heroSlides.length) % heroSlides.length
                    )
                  }
                  aria-label="Previous banner"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:border-blue-300/40 hover:bg-blue-500/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Go to banner ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      heroIndex === index
                        ? "w-7 bg-blue-400"
                        : "w-2 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex((heroIndex + 1) % heroSlides.length)
                  }
                  aria-label="Next banner"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:border-blue-300/40 hover:bg-blue-500/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-8 sm:pb-10">
        <div className="PrimeBasket-container">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-[#101827] p-4 sm:grid-cols-4 sm:gap-0 sm:p-5">
            <Benefit
              icon={<Truck className="h-5 w-5" />}
              title="Easy delivery"
              subtitle="Shopping made simple"
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Secure checkout"
              subtitle="Protected payments"
            />
            <Benefit
              icon={<PackageCheck className="h-5 w-5" />}
              title="Order updates"
              subtitle="Stay in the loop"
            />
            <Benefit
              icon={<Headphones className="h-5 w-5" />}
              title="Here to help"
              subtitle="Support when needed"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-11">
        <div className="PrimeBasket-container">
          <SectionHeading
            eyebrow="A WORLD OF CHOICE"
            title="Shop by category"
            description="Find your everyday favourites, all in one place."
            action="View all products"
            href="/products"
          />

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?search=${encodeURIComponent(category.query)}`}
                className="group rounded-2xl border border-white/[0.08] bg-[#101827] p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-[#131f33] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] sm:p-5"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/15 to-indigo-500/5 text-3xl transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                  {category.icon}
                </div>

                <p className="mt-3 text-xs font-bold text-slate-200 transition group-hover:text-blue-300">
                  {category.name}
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Explore {index + 1}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best picks */}
      <section className="border-y border-white/[0.07] bg-[#0d1421] py-9 sm:py-12">
        <div className="PrimeBasket-container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
                <Zap className="h-4 w-4" />
                Worth a closer look
              </p>

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Picks for your day.
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Explore products available in the store.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => scrollProducts("left")}
                aria-label="Scroll products left"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300 sm:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollProducts("right")}
                aria-label="Scroll products right"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300 sm:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 transition hover:text-blue-200"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <ProductSkeletonRow />
          ) : dealProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="w-full overflow-hidden">
              <div
                id="deals-products-track"
                className="flex w-max gap-4 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${productScroll}px)` }}
              >
                {dealProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    image={getProductImage(product, index)}
                    liked={likedProducts.includes(product.id)}
                    adding={addingId === product.id}
                    wishlistBusy={wishlistLoadingId === product.id}
                    onWishlist={() => void toggleWishlist(product.id)}
                    onAdd={() => void handleAddToCart(product.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Promotional cards */}
      <section className="py-9 sm:py-12">
        <div className="PrimeBasket-container">
          <SectionHeading
            eyebrow="A LITTLE INSPIRATION"
            title="Something for every day."
            description="Explore different corners of your marketplace."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <PromoCard
              title="Tech & gadgets"
              subtitle="Make everyday tasks a little smarter."
              label="Explore electronics"
              icon="🎧"
              image="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85"
              href="/products?search=electronics"
            />

            <PromoCard
              title="Style that feels you"
              subtitle="Find pieces for your everyday routine."
              label="Explore fashion"
              icon="👟"
              image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85"
              href="/products?search=fashion"
            />

            <PromoCard
              title="Home, made lovely"
              subtitle="Small finds for the spaces you love."
              label="Explore home"
              icon="🏡"
              image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85"
              href="/products?search=home"
            />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="border-y border-white/[0.07] bg-[#0d1421] py-9 sm:py-12">
        <div className="PrimeBasket-container">
          <SectionHeading
            eyebrow="MORE TO DISCOVER"
            title="You might like these."
            description="Keep exploring the products in our marketplace."
            action="Explore all"
            href="/products"
          />

          {loading ? (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="mt-7">
              <EmptyProducts />
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {trendingProducts.slice(0, 10).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  image={getProductImage(product, index + 3)}
                  liked={likedProducts.includes(product.id)}
                  adding={addingId === product.id}
                  wishlistBusy={wishlistLoadingId === product.id}
                  onWishlist={() => void toggleWishlist(product.id)}
                  onAdd={() => void handleAddToCart(product.id)}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand story */}
      <section className="py-12 sm:py-16">
        <div className="PrimeBasket-container">
          <div className="grid items-center gap-8 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#111c2e] via-[#101827] to-[#0d1421] p-6 sm:p-9 md:grid-cols-2 md:p-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400 sm:text-xs">
                THE PRIME BASKET DIFFERENCE
              </p>

              <h2 className="mt-3 max-w-lg text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                Shopping should feel as good as finding something you love.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
                Prime Basket brings product discovery and everyday shopping
                together in one convenient marketplace. Explore, choose your
                favourites and enjoy a simpler shopping experience.
              </p>

              <Link
                to="/products"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Explore the marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StoryCard
                icon={<ShoppingBag className="h-5 w-5" />}
                title="Easy discovery"
                description="Browse categories and find products in fewer steps."
              />

              <StoryCard
                icon={<BadgeCheck className="h-5 w-5" />}
                title="Clear choices"
                description="View product details and prices before making a choice."
                offset
              />

              <StoryCard
                icon={<Heart className="h-5 w-5" />}
                title="Your favourites"
                description="Save products to your wishlist and revisit them anytime."
              />

              <StoryCard
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Simple shopping"
                description="Add products to your cart and continue when you're ready."
                offset
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="PrimeBasket-container">
          <div className="relative isolate overflow-hidden rounded-[28px] border border-blue-300/20 bg-gradient-to-br from-[#142c50] via-[#102344] to-[#11152b] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="absolute -left-16 -top-20 -z-10 h-56 w-56 rounded-full border border-blue-300/15" />
            <div className="absolute -bottom-28 -right-12 -z-10 h-72 w-72 rounded-full border-[35px] border-blue-300/[0.07]" />
            <div className="absolute left-1/2 top-0 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/15 blur-[90px]" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Your next great find awaits
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                A little discovery.
                <br />
                <span className="text-blue-300">A lot of delight.</span>
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Take a look around and discover the products that make your
                everyday a little better.
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-500 px-6 text-sm font-extrabold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Start exploring <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

/* Section heading */

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  href?: string;
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  href = "/products",
}: SectionHeadingProps) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>

    {action && (
      <Link
        to={href}
        className="mb-1 inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-300 transition hover:text-blue-200"
      >
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

/* Benefits */

type BenefitProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
};

const Benefit = ({ icon, title, subtitle }: BenefitProps) => (
  <div className="flex items-center gap-3 px-2 py-3 sm:px-4 sm:py-2">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
      {icon}
    </div>

    <div>
      <p className="text-xs font-bold text-slate-100">{title}</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-400">{subtitle}</p>
    </div>
  </div>
);

/* Product card */

type ProductCardProps = {
  product: Product;
  image: string;
  liked: boolean;
  adding: boolean;
  wishlistBusy?: boolean;
  onWishlist: () => void;
  onAdd: () => void;
  compact?: boolean;
};

const ProductCard = ({
  product,
  image,
  liked,
  adding,
  wishlistBusy = false,
  onWishlist,
  onAdd,
  compact = false,
}: ProductCardProps) => (
  <article
    className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111a29] transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.28)] ${
      compact ? "min-w-0" : "w-[218px] shrink-0 sm:w-[235px] lg:w-[250px]"
    }`}
  >
    <div className="product-image-wrap relative aspect-square">
      <Link
        to={`/products/${product.id}`}
        className="block h-full w-full"
        aria-label={`View ${product.name}`}
      >
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImages[0];
          }}
        />
      </Link>

      <span className="absolute left-3 top-3 rounded-full border border-emerald-300/15 bg-[#0b1720]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 shadow-sm backdrop-blur-md">
        {product.stockQuantity > 0 ? "Available" : "Out of stock"}
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
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition disabled:cursor-wait disabled:opacity-60 ${
          liked
            ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
            : "border-white/15 bg-[#0b1220]/80 text-slate-200 hover:border-rose-400/30 hover:text-rose-300"
        }`}
      >
        <Heart
          className={`h-4 w-4 ${liked ? "fill-current" : ""} ${
            wishlistBusy ? "animate-pulse" : ""
          }`}
        />
      </button>
    </div>

    <div className={compact ? "p-3 sm:p-4" : "p-4"}>
      <p className="mb-2 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-blue-400">
        {product.categoryName || "Discover"}
      </p>

      <Link to={`/products/${product.id}`} className="block">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-100 transition hover:text-blue-300">
          {product.name}
        </h3>
      </Link>

      {product.description && (
        <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">
          {product.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-base font-black tracking-tight text-white">
          {formatPrice(product.price)}
        </span>

        <span className="text-[10px] text-slate-400">
          {product.stockQuantity} left
        </span>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={adding || product.stockQuantity <= 0}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 text-xs font-bold text-blue-200 transition hover:border-blue-400/30 hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" />
        {adding ? "Adding to cart..." : "Add to cart"}
      </button>
    </div>
  </article>
);

/* Promotional card */

type PromoCardProps = {
  title: string;
  subtitle: string;
  label: string;
  icon: string;
  image: string;
  href: string;
};

const PromoCard = ({
  title,
  subtitle,
  label,
  icon,
  image,
  href,
}: PromoCardProps) => (
  <Link
    to={href}
    className="group relative isolate flex min-h-[255px] flex-col justify-end overflow-hidden rounded-[22px] border border-white/10 bg-[#111a29] p-6 text-white transition hover:border-blue-400/30 sm:min-h-[275px]"
  >
    <img
      src={image}
      alt=""
      loading="lazy"
      className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />

    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080d17]/95 via-[#0b1423]/60 to-[#0b1423]/10" />

    <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-[#0b1220]/55 text-2xl backdrop-blur-md">
      {icon}
    </span>

    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
        PRIMEBASKET COLLECTION
      </p>

      <h3 className="mt-2 text-xl font-black sm:text-2xl">{title}</h3>

      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-300">
        {subtitle}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-blue-200">
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

/* Story card */

type StoryCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  offset?: boolean;
};

const StoryCard = ({
  icon,
  title,
  description,
  offset = false,
}: StoryCardProps) => (
  <div
    className={`rounded-2xl border border-white/[0.07] bg-[#0c1422] p-5 sm:p-6 ${
      offset ? "mt-5 sm:mt-8" : ""
    }`}
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
      {icon}
    </div>

    <h3 className="mt-5 text-sm font-extrabold text-slate-100">{title}</h3>

    <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
  </div>
);

/* Loading skeletons */

const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111a29]">
    <div className="aspect-square animate-pulse bg-[#1b2739]" />

    <div className="space-y-3 p-3 sm:p-4">
      <div className="h-2.5 w-20 animate-pulse rounded bg-[#25334a]" />
      <div className="h-3 w-full animate-pulse rounded bg-[#25334a]" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-[#25334a]" />
      <div className="h-5 w-24 animate-pulse rounded bg-[#25334a]" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-[#25334a]" />
    </div>
  </div>
);

const ProductSkeletonRow = () => (
  <div className="no-scrollbar flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="w-[218px] shrink-0 sm:w-[235px]">
        <ProductSkeleton />
      </div>
    ))}
  </div>
);

/* Empty state */

const EmptyProducts = () => (
  <div className="rounded-2xl border border-dashed border-white/15 bg-[#101827] px-5 py-12 text-center sm:py-16">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
      <ShoppingBag className="h-6 w-6" />
    </div>

    <h3 className="mt-5 text-lg font-black text-white">
      Your next find is on its way.
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
      There are no available products to show right now. Visit the products
      page to explore the marketplace.
    </p>

    <Link
      to="/products"
      className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-500 px-5 text-xs font-bold text-white transition hover:bg-blue-400"
    >
      Browse products <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default Home;
