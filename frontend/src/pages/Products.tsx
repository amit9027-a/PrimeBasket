import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { addItem } from "@/features/cart/cartThunks";
import { useAppDispatch } from "@/hooks";
import { Search, ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

type Product = {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  description?: string;
  categoryName: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    primaryImage: boolean;
  }>;
};

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
  const [cartFeedback, setCartFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await api.get<Product[]>("/products");
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
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
        activeCategory === "All" || product.categoryName === activeCategory;

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
      await dispatch(addItem({ productId: product.id, quantity: 1 })).unwrap();
      setCartFeedback((current) => ({
        ...current,
        [product.id]: "Added to cart",
      }));
    } catch (error: any) {
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

  return (
    <main className="min-h-screen bg-paper pb-20">
      <section className="border-b border-line bg-paper-alt/50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.08em] text-moss uppercase">
                Specimen archive
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <h1
              className="m-0 max-w-3xl text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.03em] text-ink"
              style={{ fontFamily: FONTS.display, fontWeight: 500 }}
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
              I wanted this page to feel like the same world as the home page:
              quiet, editorial, and product-first. So the customer can search,
              filter, and move through the collection without losing the
              PrimeBasket tone.
            </p>
          </div>

          <div className="grid gap-4 rounded-[2px] border border-line bg-card-alt p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-brass uppercase">
                  Collection note
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Search by name, material, or category and explore the full set
                  of products now available in the store.
                </p>
              </div>
              <Sparkles
                className="mt-1 shrink-0 text-moss"
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Stat label="Products listed" value={String(products.length)} />
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, category, or description"
              className="fs-input w-full rounded-none border border-line bg-card-alt py-4 pr-4 pl-12 text-sm text-ink placeholder:text-ink-faint"
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
                  onClick={() => setActiveCategory(category)}
                  className="fs-cat-btn border px-4 py-2 text-[12px] tracking-[0.06em] uppercase"
                  style={{
                    fontFamily: FONTS.mono,
                    background: isActive ? TOKENS.ink : "transparent",
                    color: isActive ? TOKENS.paper : TOKENS.inkSoft,
                    borderColor: isActive ? TOKENS.ink : TOKENS.line,
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
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-4/5 border border-line bg-paper-alt" />
                <div className="mt-4 h-4 w-2/3 bg-paper-alt" />
                <div className="mt-2 h-3 w-1/2 bg-paper-alt" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xs border border-line bg-card-alt p-8 text-center">
            <p className="font-display text-2xl text-ink">
              The catalogue is resting.
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              I could not load the products right now. Please try again in a
              moment.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xs border border-line bg-card-alt p-10 text-center">
            <p className="font-display text-3xl text-ink">No specimens found</p>
            <p className="mt-3 text-sm text-ink-soft">
              Try another search term or switch to a different category.
            </p>
          </div>
        ) : (
          <div className="fs-product-grid grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <article key={product.id} className="group flex flex-col">
                <div className="relative overflow-hidden border border-line bg-paper-alt">
                  <span className="absolute top-3 left-3 z-10 border border-line bg-card-alt px-2 py-1 font-mono text-[10px] text-ink-soft">
                    No. {String(index + 1).padStart(3, "0")}
                  </span>

                  <div className="absolute top-3 right-3 z-10 border border-[rgba(27,26,21,0.08)] bg-[rgba(251,250,246,0.92)] px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-moss uppercase">
                    {product.categoryName}
                  </div>

                  <img
                    src={product.images?.[0]?.imageUrl || "/default-img.webp"}
                    alt={product.name}
                    className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-[rgba(27,26,21,0.9)] px-4 py-3 text-paper transition-transform duration-300 group-hover:translate-y-0">
                    <span className="font-body text-[11px] tracking-[0.08em] uppercase">
                      View product
                    </span>
                    <ArrowUpRight size={14} strokeWidth={1.7} />
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2
                        className="text-[1.05rem] leading-[1.3] text-ink"
                        style={{ fontFamily: FONTS.display, fontWeight: 500 }}
                      >
                        {product.name}
                      </h2>
                      {/* <p className="mt-1 text-sm leading-6 text-ink-faint">
                        {product.description ||
                          "A considered object for everyday use."}
                      </p> */}
                    </div>
                    <span className="shrink-0 font-mono text-[13px] text-ink">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
                      {product.stockQuantity > 0
                        ? `${product.stockQuantity} in stock`
                        : "Out of stock"}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={
                          product.stockQuantity <= 0 ||
                          activeCartId === product.id
                        }
                        onClick={() => handleAddToCart(product)}
                        className="border border-line px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-ink uppercase transition-colors hover:bg-paper-alt"
                      >
                        <ShoppingBag className="mr-2 inline size-3.5" />
                        {activeCartId === product.id ? "Adding" : "Add"}
                      </button>
                      <Link
                        to={`/products/${product.id}`}
                        className="font-mono text-[11px] tracking-[0.06em] text-moss uppercase"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                  {cartFeedback[product.id] ? (
                    <p className="mt-3 text-[11px] tracking-[0.04em] text-moss">
                      {cartFeedback[product.id]}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
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

export default Products;
