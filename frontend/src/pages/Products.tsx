import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { addItem } from "@/features/cart/cartThunks";
import { useAppDispatch } from "@/hooks";
import {
  ArrowUpRight,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

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
  categoryName: string;
  images?: ProductImage[];
};

type WishlistProduct = {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  imageUrl: string;
};

const WISHLIST_KEY = "primebasket_wishlist";

const TOKENS = {
  paper: "#F5F3EC",
  paperAlt: "#EDE9DF",
  ink: "#1B1A15",
  inkSoft: "#5B584E",
  inkFaint: "#8C8879",
  moss: "#42502F",
  mossDark: "#333F24",
  mossPale: "#E3E7D6",
  brass: "#AD8A52",
  brassLight: "#C9AD7A",
  line: "#D9D3C3",
  card: "#FBFAF6",
  white: "#FFFFFF",
};

const FONTS = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  body: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

/* =========================================================
   WISHLIST HELPERS
========================================================= */

const getWishlist = (): WishlistProduct[] => {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Unable to read wishlist:", error);
    return [];
  }
};

const saveWishlist = (wishlist: WishlistProduct[]) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));

    
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    console.error("Unable to save wishlist:", error);
  }
};



const Products = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [activeCartId, setActiveCartId] = useState<number | null>(null);

  const [cartFeedback, setCartFeedback] = useState<
    Record<number, string>
  >({});

  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await api.get<Product[]>("/products");

        setProducts(response.data);
      } catch (error) {
        console.error("Unable to load products:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  

  useEffect(() => {
    const wishlist = getWishlist();

    setWishlistIds(wishlist.map((item) => item.id));
  }, []);

  

  useEffect(() => {
    const syncWishlist = () => {
      const wishlist = getWishlist();

      setWishlistIds(wishlist.map((item) => item.id));
    };

    window.addEventListener("wishlistUpdated", syncWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlist);
    };
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(products.map((product) => product.categoryName)),
    ).sort();

    return ["All", ...values];
  }, [products]);

 

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.categoryName === activeCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setActiveCartId(product.id);

    setCartFeedback((current) => ({
      ...current,
      [product.id]: "",
    }));

    try {
      await dispatch(
        addItem({
          productId: product.id,
          quantity: 1,
        }),
      ).unwrap();

      setCartFeedback((current) => ({
        ...current,
        [product.id]: "Added to cart",
      }));
    } catch (error: any) {
      console.error("Add to cart error:", error);

      setCartFeedback((current) => ({
        ...current,
        [product.id]:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to add this product right now.",
      }));
    } finally {
      setActiveCartId(null);
    }
  };


  const handleToggleWishlist = (product: Product) => {
    const currentWishlist = getWishlist();

    const alreadyLiked = currentWishlist.some(
      (item) => item.id === product.id,
    );

    let updatedWishlist: WishlistProduct[];

    if (alreadyLiked) {
      
      updatedWishlist = currentWishlist.filter(
        (item) => item.id !== product.id,
      );
    } else {
      
      const wishlistProduct: WishlistProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        categoryName: product.categoryName,
        imageUrl:
          product.images?.find((image) => image.primaryImage)
            ?.imageUrl ||
          product.images?.[0]?.imageUrl ||
          "/default-img.webp",
      };

      updatedWishlist = [
        ...currentWishlist,
        wishlistProduct,
      ];
    }

    saveWishlist(updatedWishlist);

    setWishlistIds(updatedWishlist.map((item) => item.id));
  };

 
  const isProductLiked = (productId: number) => {
    return wishlistIds.includes(productId);
  };

 

  return (
    <main className="min-h-screen bg-paper pb-20">
     

      <section className="border-b border-line bg-paper-alt/50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span
                className="font-mono text-xs tracking-[0.08em] text-moss uppercase"
                style={{ fontFamily: FONTS.mono }}
              >
                Specimen archive
              </span>

              <span className="h-px flex-1 bg-line" />
            </div>

            <h1
              className="m-0 max-w-3xl text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.03em] text-ink"
              style={{
                fontFamily: FONTS.display,
                fontWeight: 500,
              }}
            >
              Browse the full
              <br />

              <span className="italic font-normal text-moss">
                catalogue of goods
              </span>
            </h1>

            <p
              className="mt-6 max-w-2xl text-base leading-7 text-ink-soft"
              style={{ fontFamily: FONTS.body }}
            >
              Discover carefully selected products from the
              PrimeBasket collection. Search, filter, save your
              favourites, and add products directly to your cart.
            </p>
          </div>

          <div className="grid gap-4 rounded-[2px] border border-line bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase"
                  style={{ fontFamily: FONTS.mono }}
                >
                  Collection note
                </p>

                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Search by name, material, or category and explore
                  the full collection available in the store.
                </p>
              </div>

              <Sparkles
                className="mt-1 shrink-0 text-moss"
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Stat
                label="Products listed"
                value={String(products.length)}
              />

              <Stat
                label="Filtered results"
                value={String(filteredProducts.length)}
              />
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-5 border-b border-line pb-8">
          <div className="relative max-w-2xl">
            <Search
              size={18}
              strokeWidth={1.6}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, category, or description"
              className="fs-input w-full rounded-none border border-line bg-card py-4 pr-4 pl-12 text-sm text-ink placeholder:text-ink-faint"
              style={{ fontFamily: FONTS.body }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className="fs-cat-btn border px-4 py-2 text-[12px] tracking-[0.06em] uppercase"
                  style={{
                    fontFamily: FONTS.mono,
                    background: isActive
                      ? TOKENS.ink
                      : "transparent",
                    color: isActive
                      ? TOKENS.paper
                      : TOKENS.inkSoft,
                    borderColor: isActive
                      ? TOKENS.ink
                      : TOKENS.line,
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

     

      <section className="mx-auto max-w-7xl px-6 pt-10">
        {/* LOADING */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >
                <div className="aspect-4/5 border border-line bg-paper-alt" />

                <div className="mt-4 h-4 w-2/3 bg-paper-alt" />

                <div className="mt-2 h-3 w-1/2 bg-paper-alt" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* ERROR */
          <div className="rounded-xs border border-line bg-card p-8 text-center">
            <p
              className="text-2xl text-ink"
              style={{
                fontFamily: FONTS.display,
              }}
            >
              The catalogue is resting.
            </p>

            <p className="mt-3 text-sm text-ink-soft">
              I could not load the products right now.
              Please try again in a moment.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* EMPTY */
          <div className="rounded-xs border border-line bg-card p-10 text-center">
            <p
              className="text-3xl text-ink"
              style={{
                fontFamily: FONTS.display,
              }}
            >
              No specimens found
            </p>

            <p className="mt-3 text-sm text-ink-soft">
              Try another search term or switch to a
              different category.
            </p>
          </div>
        ) : (
          /* PRODUCTS */
          <div className="fs-product-grid grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const liked = isProductLiked(product.id);

              const productImage =
                product.images?.find(
                  (image) => image.primaryImage,
                )?.imageUrl ||
                product.images?.[0]?.imageUrl ||
                "/default-img.webp";

              return (
                <article
                  key={product.id}
                  className="group flex flex-col"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative overflow-hidden border border-line bg-paper-alt">
                    {/* NUMBER */}
                    <span className="absolute top-3 left-3 z-10 border border-line bg-card px-2 py-1 font-mono text-[10px] text-ink-soft">
                      No. {String(index + 1).padStart(3, "0")}
                    </span>

                    {/* CATEGORY */}
                    <div className="absolute top-3 right-3 z-10 border border-[rgba(27,26,21,0.08)] bg-[rgba(251,250,246,0.92)] px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-moss uppercase">
                      {product.categoryName}
                    </div>

                    {/* IMAGE */}
                    <Link
                      to={`/products/${product.id}`}
                      className="block"
                    >
                      <img
                        src={productImage}
                        alt={product.name}
                        className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                    </Link>

                    {/* WISHLIST BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleWishlist(product)
                      }
                      aria-label={
                        liked
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      aria-pressed={liked}
                      className="absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card shadow-sm transition-all duration-200 hover:scale-105"
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.7}
                        fill={
                          liked
                            ? "#EF3340"
                            : "transparent"
                        }
                        color={
                          liked
                            ? "#EF3340"
                            : TOKENS.inkSoft
                        }
                      />
                    </button>

                    {/* VIEW PRODUCT HOVER */}
                    <Link
                      to={`/products/${product.id}`}
                      className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-[rgba(27,26,21,0.9)] px-4 py-3 text-paper transition-transform duration-300 group-hover:translate-y-0"
                    >
                      <span
                        className="font-mono text-[11px] tracking-[0.08em] uppercase"
                        style={{
                          fontFamily: FONTS.mono,
                        }}
                      >
                        View product
                      </span>

                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.7}
                      />
                    </Link>
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2
                          className="text-[1.05rem] leading-[1.3] text-ink"
                          style={{
                            fontFamily: FONTS.display,
                            fontWeight: 500,
                          }}
                        >
                          {product.name}
                        </h2>
                      </div>

                      <span className="shrink-0 font-mono text-[13px] text-ink">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* BOTTOM INFO */}
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <span className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
                        {product.stockQuantity > 0
                          ? `${product.stockQuantity} in stock`
                          : "Out of stock"}
                      </span>

                      <div className="flex items-center gap-3">
                        {/* ADD TO CART */}
                        <button
                          type="button"
                          disabled={
                            product.stockQuantity <= 0 ||
                            activeCartId === product.id
                          }
                          onClick={() =>
                            handleAddToCart(product)
                          }
                          className="border border-line bg-transparent px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-ink uppercase transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShoppingBag
                            className="mr-2 inline size-3.5"
                          />

                          {activeCartId === product.id
                            ? "Adding"
                            : "Add"}
                        </button>

                        {/* DETAILS */}
                        <Link
                          to={`/products/${product.id}`}
                          className="font-mono text-[11px] tracking-[0.06em] text-moss uppercase hover:underline"
                        >
                          Details
                        </Link>
                      </div>
                    </div>

                    {/* CART FEEDBACK */}
                    {cartFeedback[product.id] ? (
                      <p className="mt-3 text-[11px] tracking-[0.04em] text-moss">
                        {cartFeedback[product.id]}
                      </p>
                    ) : null}

                    {/* WISHLIST FEEDBACK */}
                    {liked ? (
                      <p className="mt-2 font-mono text-[10px] tracking-[0.04em] text-moss uppercase">
                        Saved to wishlist
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
        {label}
      </p>

      <p
        className="mt-2 text-3xl leading-none text-ink"
        style={{
          fontFamily: FONTS.display,
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );
};

export default Products;