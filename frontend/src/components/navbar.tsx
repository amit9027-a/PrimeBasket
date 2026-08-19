import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCart } from "@/features/cart/cartThunks";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
  Trash2,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

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

const WISHLIST_KEY = "primebasket_wishlist";

type WishlistProduct = {
  id: number;
  name: string;
  price: number;
  categoryName?: string;
  imageUrl: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const Navbar = () => {
  const { user, logout } = useAuth();

  const dispatch = useAppDispatch();

  const totalItems = useAppSelector(
    (state) => state.cart.totalItems,
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const [wishlistOpen, setWishlistOpen] = useState(false);

  const [wishlistProducts, setWishlistProducts] = useState<
    WishlistProduct[]
  >([]);

  /*
   * =========================================================
   * LOAD WISHLIST FROM LOCAL STORAGE
   * =========================================================
   *
   * Products.tsx stores the complete product object:
   *
   * [
   *   {
   *     id,
   *     name,
   *     price,
   *     categoryName,
   *     imageUrl
   *   }
   * ]
   *
   * So Navbar must read the same structure.
   */
  const loadWishlist = () => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);

      if (!stored) {
        setWishlistProducts([]);
        return;
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setWishlistProducts([]);
        return;
      }

      const validProducts: WishlistProduct[] = parsed.filter(
        (item): item is WishlistProduct => {
          return (
            item !== null &&
            typeof item === "object" &&
            "id" in item &&
            "name" in item &&
            "price" in item &&
            "imageUrl" in item
          );
        },
      );

      setWishlistProducts(validProducts);
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error,
      );

      setWishlistProducts([]);
    }
  };

  /*
   * =========================================================
   * CART
   * =========================================================
   */

  useEffect(() => {
    if (!user) return;

    dispatch(fetchCart()).catch(() => {
      // Keep navbar resilient if cart API is unavailable.
    });
  }, [dispatch, user]);

  /*
   * =========================================================
   * INITIAL WISHLIST LOAD
   * =========================================================
   */

  useEffect(() => {
    loadWishlist();
  }, []);

  /*
   * =========================================================
   * LISTEN FOR WISHLIST CHANGES
   * =========================================================
   *
   * Products.tsx dispatches:
   *
   * window.dispatchEvent(
   *   new Event("wishlistUpdated")
   * );
   *
   * Therefore Navbar must listen to exactly the same event.
   */

  useEffect(() => {
    const handleWishlistChange = () => {
      loadWishlist();
    };

    window.addEventListener(
      "wishlistUpdated",
      handleWishlistChange,
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        handleWishlistChange,
      );
    };
  }, []);

  /*
   * =========================================================
   * REMOVE FROM WISHLIST
   * =========================================================
   */

  const removeFromWishlist = (productId: number) => {
    const updatedWishlist = wishlistProducts.filter(
      (product) => product.id !== productId,
    );

    setWishlistProducts(updatedWishlist);

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(updatedWishlist),
    );

    /*
     * Notify Products.tsx as well.
     */
    window.dispatchEvent(
      new Event("wishlistUpdated"),
    );
  };

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setWishlistOpen(false);
  };

  /*
   * =========================================================
   * NAV ITEMS
   * =========================================================
   */

  const navItems = [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Products",
      to: "/products",
    },
    {
      label: "Orders",
      to: "/orders",
    },
    {
      label: "Cart",
      to: "/cart",
    },
  ];

  /*
   * =========================================================
   * JSX
   * =========================================================
   */

  return (
    <>
      {/* TOP SHIPPING BAR */}

      <div className="bg-ink text-ink-faint font-mono flex items-center justify-between px-6 py-2 text-[11px] tracking-[0.04em]">
        <span className="text-[#C7C4B6]">
          FREE SHIPPING ON ORDERS OVER ₹5,000 — SHIPS
          WORLDWIDE
        </span>

        <span className="fs-desktop-only hidden">
          EN &nbsp;/&nbsp; INR ₹
        </span>
      </div>

      {/* MAIN NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}

          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-[0.01em] text-ink no-underline"
          >
            PrimeBasket
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="fs-desktop-nav flex gap-9 text-[13px] tracking-[0.03em] uppercase text-ink">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="fs-nav-link text-ink"
              >
                {item.label}
              </Link>
            ))}

            {user?.role === "ADMIN" && (
              <Link
                to="/admin/products/create"
                className="fs-nav-link text-moss"
              >
                Create Product
              </Link>
            )}
          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-5">

            {/* SEARCH */}

            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0"
              aria-label="Search"
            >
              <Search
                size={18}
                strokeWidth={1.5}
                color={TOKENS.ink}
              />
            </button>

            {/* =================================================
                WISHLIST
            ================================================= */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setWishlistOpen(
                    (current) => !current,
                  )
                }
                className="relative cursor-pointer border-none bg-transparent p-0"
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  className={
                    wishlistProducts.length > 0
                      ? "fill-red-500 text-red-500"
                      : "text-ink"
                  }
                />

                {/* WISHLIST COUNT */}

                {wishlistProducts.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] text-white">
                    {wishlistProducts.length}
                  </span>
                )}
              </button>

              {/* WISHLIST DROPDOWN */}

              {wishlistOpen && (
                <div className="absolute top-8 right-0 z-[100] w-[330px] border border-line bg-card shadow-2xl">

                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-line px-4 py-4">
                    <div>
                      <p
                        className="text-lg text-ink"
                        style={{
                          fontFamily:
                            "'Fraunces', Georgia, serif",
                        }}
                      >
                        Wishlist
                      </p>

                      <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-ink-faint uppercase">
                        {wishlistProducts.length}{" "}
                        {wishlistProducts.length === 1
                          ? "item"
                          : "items"}
                      </p>
                    </div>

                    <Heart
                      size={17}
                      className="fill-red-500 text-red-500"
                    />
                  </div>

                  {/* EMPTY WISHLIST */}

                  {wishlistProducts.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Heart
                        size={30}
                        strokeWidth={1.2}
                        className="mx-auto text-ink-faint"
                      />

                      <p
                        className="mt-4 text-lg text-ink"
                        style={{
                          fontFamily:
                            "'Fraunces', Georgia, serif",
                        }}
                      >
                        Your wishlist is empty
                      </p>

                      <p className="mt-2 text-xs leading-5 text-ink-soft">
                        Click the heart on a product
                        to save it here.
                      </p>

                      <Link
                        to="/products"
                        onClick={() =>
                          setWishlistOpen(false)
                        }
                        className="mt-5 inline-flex border border-line px-4 py-2 font-mono text-[10px] tracking-[0.06em] text-ink uppercase"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (

                    /* WISHLIST ITEMS */

                    <div className="max-h-[360px] overflow-y-auto">
                      {wishlistProducts.map(
                        (product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 border-b border-line px-4 py-3"
                          >
                            {/* PRODUCT IMAGE */}

                            <Link
                              to={`/products/${product.id}`}
                              onClick={() =>
                                setWishlistOpen(
                                  false,
                                )
                              }
                              className="shrink-0"
                            >
                              <img
                                src={
                                  product.imageUrl ||
                                  "/default-img.webp"
                                }
                                alt={product.name}
                                className="h-16 w-16 border border-line object-cover"
                              />
                            </Link>

                            {/* PRODUCT INFO */}

                            <Link
                              to={`/products/${product.id}`}
                              onClick={() =>
                                setWishlistOpen(
                                  false,
                                )
                              }
                              className="min-w-0 flex-1 no-underline"
                            >
                              <p className="truncate text-sm text-ink">
                                {product.name}
                              </p>

                              <p className="mt-1 font-mono text-[11px] text-ink-soft">
                                {formatPrice(
                                  product.price,
                                )}
                              </p>
                            </Link>

                            {/* REMOVE */}

                            <button
                              type="button"
                              onClick={() =>
                                removeFromWishlist(
                                  product.id,
                                )
                              }
                              className="cursor-pointer border-none bg-transparent p-1 text-ink-faint transition-colors hover:text-red-500"
                              aria-label={`Remove ${product.name} from wishlist`}
                            >
                              <Trash2
                                size={15}
                                strokeWidth={1.5}
                              />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CART */}

            <Link
              to="/cart"
              className="relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.5}
                color={TOKENS.ink}
              />

              {totalItems > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-moss px-1 font-mono text-[9px] text-moss-pale">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* AUTH */}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden cursor-pointer border border-line bg-transparent px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-ink uppercase md:inline-flex"
              >
                Logout
              </button>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition hover:bg-paper-alt"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="border border-ink bg-ink px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-white uppercase transition hover:opacity-90"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              className="fs-mobile-toggle cursor-pointer border-none bg-transparent p-0 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-line bg-paper px-6 py-5 md:hidden">
            <nav className="flex flex-col gap-5 font-mono text-[12px] tracking-[0.08em] uppercase">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-ink"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  {item.label}
                </Link>
              ))}

              {user?.role === "ADMIN" && (
                <Link
                  to="/admin/products/create"
                  className="text-moss"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Create Product
                </Link>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-fit cursor-pointer border-none bg-transparent p-0 text-left font-mono text-[12px] tracking-[0.08em] text-ink uppercase"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-ink"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="text-ink"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;