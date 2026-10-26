
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCart } from "@/features/cart/cartThunks";
import { getWishlist } from "@/features/wishlist/wishlistAPI";
import {
  getAllSupportConversations,
  getMySupportConversations,
  type SupportConversation,
} from "@/features/support/supportAPI";
import SupportUnreadBadge from "@/features/support/SupportUnreadBadge";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Orders", to: "/orders" },
  { label: "Gift Cards", to: "/gift-cards" },
  { label: "Support", to: "/support" },
];

const SUPPORT_READ_EVENT = "support-read-updated";
const SUPPORT_REFRESH_INTERVAL = 15000;

function normalizeRole(role?: string): string {
  return (role ?? "").replace(/^ROLE_/, "").toUpperCase();
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = useAppSelector((state) => state.cart.totalItems);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(
    new URLSearchParams(location.search).get("search") || "",
  );

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    dispatch(fetchCart()).catch(() => {
      // Keep navigation usable if cart API fails.
    });
  }, [dispatch, user]);

  useEffect(() => {
    let cancelled = false;

    const loadWishlistCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }

      try {
        const wishlist = await getWishlist();

        if (!cancelled) {
          setWishlistCount(wishlist.length);
        }
      } catch (error) {
        console.error("Unable to load wishlist count:", error);
      }
    };

    const handleWishlistUpdate = () => {
      void loadWishlistCount();
    };

    void loadWishlistCount();

    window.addEventListener("wishlist-updated", handleWishlistUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(
        "wishlist-updated",
        handleWishlistUpdate,
      );
    };
  }, [user, location.pathname]);

  // Read unread counts from the backend response, not localStorage.
  useEffect(() => {
    let cancelled = false;

    const loadSupportUnreadCount = async () => {
      if (!user) {
        setSupportUnreadCount(0);
        return;
      }

      try {
        const isAdmin = normalizeRole(user.role) === "ADMIN";

        const conversations: SupportConversation[] = isAdmin
          ? await getAllSupportConversations()
          : await getMySupportConversations();

        if (cancelled) return;

        const unread = conversations.reduce(
          (total, conversation) =>
            total + Math.max(0, Number(conversation.unreadCount) || 0),
          0,
        );

        setSupportUnreadCount(unread);
      } catch (error) {
        // Don't break the rest of the navigation if Support is unavailable.
        console.error("Unable to load support notifications:", error);
      }
    };

    const handleSupportReadUpdate = () => {
      void loadSupportUnreadCount();
    };

    void loadSupportUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadSupportUnreadCount();
    }, SUPPORT_REFRESH_INTERVAL);

    window.addEventListener(
      SUPPORT_READ_EVENT,
      handleSupportReadUpdate,
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener(
        SUPPORT_READ_EVENT,
        handleSupportReadUpdate,
      );
    };
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchValue(
      new URLSearchParams(location.search).get("search") || "",
    );
  }, [location.pathname, location.search]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchValue.trim();

    navigate(
      query
        ? `/products?search=${encodeURIComponent(query)}`
        : "/products",
    );

    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    setAccountOpen(false);
    setMenuOpen(false);
    setWishlistCount(0);
    setSupportUnreadCount(0);
    logout();
    navigate("/");
  };

  const initials = (
    user?.firstName?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "My Account";

  const navLinkClass = (active: boolean) =>
    `relative inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all duration-200 ${
      active
        ? "bg-blue-500/10 text-blue-300"
        : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
    }`;

  const iconButtonClass =
    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  const supportBadge = (
    <SupportUnreadBadge count={supportUnreadCount} />
  );

  return (
    <>
      {/* Announcement bar */}
      <div className="hidden border-b border-white/[0.06] bg-[#080A0F] text-white md:block">
        <div className="PrimeBasket-container flex h-9 items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>
              Discover something better.
              <span className="ml-1.5 text-slate-200">
                Welcome to Prime Basket.
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>Shopping made simple</span>
            <span className="mx-2 h-3 w-px bg-white/10" />
            <span className="text-slate-500">
              Your everyday marketplace
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B0D12]/95 text-white shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="PrimeBasket-container">
          <div className="flex min-h-[72px] items-center gap-3 sm:gap-5 lg:min-h-[82px] lg:gap-7">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Brand */}
            <Link
              to="/"
              aria-label="Prime Basket home"
              className="group flex shrink-0 items-center gap-2.5"
            >
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-blue-400/25 bg-gradient-to-br from-blue-500/20 via-blue-500/[0.08] to-transparent shadow-[0_0_24px_rgba(37,99,235,0.08)] transition duration-300 group-hover:border-blue-400/50 group-hover:shadow-[0_0_28px_rgba(37,99,235,0.18)] sm:h-11 sm:w-11">
                <ShoppingBag
                  className="h-[21px] w-[21px] text-blue-400 transition-transform duration-300 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
                <span className="absolute bottom-[7px] right-[7px] h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_9px_rgba(96,165,250,0.9)]" />
              </span>

              <span className="leading-none">
                <span className="block whitespace-nowrap text-[20px] font-extrabold tracking-[-0.065em] sm:text-[23px]">
                  <span className="text-white">Prime</span>
                  <span className="text-blue-400">Basket</span>
                </span>

                <span className="mt-2 hidden items-center gap-1.5 sm:flex">
                  <span className="h-px w-3 bg-blue-500" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.23em] text-slate-500">
                    Modern marketplace
                  </span>
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav
              aria-label="Main navigation"
              className="ml-1 hidden items-center gap-1 lg:flex"
            >
              {navItems.map((item) => {
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                  >
                    {item.label}
                    {item.to === "/support" && supportBadge}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="ml-auto hidden min-w-[130px] max-w-[360px] flex-1 md:block"
            >
              <div className="group flex h-11 items-center rounded-xl border border-white/[0.09] bg-[#11141B] px-3.5 transition-all duration-200 focus-within:border-blue-400/50 focus-within:bg-[#141925] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.09)]">
                <Search className="mr-2.5 h-[17px] w-[17px] shrink-0 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-500/15 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Action buttons */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
              {/* Wishlist */}
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                aria-label={`Wishlist, ${wishlistCount} saved products`}
                title={`Wishlist (${wishlistCount})`}
                className={`${iconButtonClass} hidden sm:flex hover:border-rose-400/15 hover:bg-rose-500/[0.08] hover:text-rose-300`}
              >
                <Heart className="h-[19px] w-[19px]" strokeWidth={1.7} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B0D12] bg-rose-500 px-1 text-[9px] font-bold leading-none text-white shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label={`Shopping cart, ${totalItems} items`}
                title="Shopping cart"
                className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                  isActive("/cart")
                    ? "border-blue-400/25 bg-blue-500/10 text-blue-300"
                    : "border-transparent text-slate-300 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-blue-300"
                }`}
              >
                <ShoppingCart
                  className="h-[19px] w-[19px] transition-transform duration-200 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B0D12] bg-blue-500 px-1 text-[9px] font-bold leading-none text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Account dropdown */}
              {user ? (
                <div ref={accountRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((previous) => !previous)}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="Account menu"
                    className={`flex h-10 items-center gap-2 rounded-xl border px-2 transition-all ${
                      accountOpen
                        ? "border-blue-400/25 bg-blue-500/10"
                        : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.035]"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-[11px] font-bold text-blue-300">
                      {initials}
                    </span>
                    <span className="hidden max-w-[105px] text-left xl:block">
                      <span className="block truncate text-[11px] font-semibold text-slate-100">
                        {user.firstName || "My Account"}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-slate-500">
                        {normalizeRole(user.role) === "ADMIN"
                          ? "Administrator"
                          : "Account"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`hidden h-3.5 w-3.5 text-slate-500 transition-transform xl:block ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[50px] w-[280px] overflow-hidden rounded-2xl border border-white/[0.10] bg-[#10131A] shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
                    >
                      <div className="border-b border-white/[0.07] bg-gradient-to-br from-blue-500/[0.12] to-transparent px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-sm font-bold text-blue-300">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {fullName}
                            </p>
                            <p className="mt-1 truncate text-[11px] text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-blue-500/[0.08] px-2.5 py-1 text-[9px] font-semibold text-blue-300">
                          <Check className="h-3 w-3" />
                          {normalizeRole(user.role) === "ADMIN"
                            ? "Admin account"
                            : "Signed in"}
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          role="menuitem"
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.045]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.035] text-slate-400">
                            <Package className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-xs font-semibold text-slate-200">
                              My Orders
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              Track your purchases
                            </span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </Link>

                        <Link
                          role="menuitem"
                          to="/cart"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.045]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                            <ShoppingCart className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-xs font-semibold text-slate-200">
                              Shopping Cart
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              {totalItems} items in your cart
                            </span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </Link>

                        <Link
                          role="menuitem"
                          to="/gift-cards"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-blue-500/[0.07]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                            <Gift className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-xs font-semibold text-slate-200">
                              Gift Cards
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              Check gift card balance
                            </span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </Link>

                        {/* Support Center */}
                        <Link
                          role="menuitem"
                          to="/support"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.045]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                            <Headphones className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-xs font-semibold text-slate-200">
                              Support Center
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              Get help with your orders
                            </span>
                          </span>
                          {supportBadge}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </Link>

                        {normalizeRole(user.role) === "ADMIN" && (
                          <Link
                            role="menuitem"
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="mt-1 flex items-center gap-3 rounded-xl border border-blue-400/15 bg-blue-500/[0.08] px-3 py-3 transition hover:bg-blue-500/[0.14]"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                              <LayoutDashboard className="h-4 w-4" />
                            </span>
                            <span className="flex-1 text-xs font-semibold text-blue-200">
                              Admin Dashboard
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                          </Link>
                        )}

                        <div className="my-2 h-px bg-white/[0.07]" />

                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-rose-500/[0.08]"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/[0.08] text-rose-400">
                            <LogOut className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-semibold text-rose-400">
                            Sign out
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/login"
                    className="flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white xl:px-4"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-blue-400/20 bg-blue-600 px-3.5 text-xs font-bold text-white shadow-[0_4px_18px_rgba(37,99,235,0.18)] transition hover:border-blue-300/50 hover:bg-blue-500 xl:px-4"
                  >
                    Sign up
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="pb-3 md:hidden"
          >
            <div className="group flex h-10 items-center rounded-xl border border-white/[0.09] bg-[#11141B] px-3 transition focus-within:border-blue-400/50 focus-within:bg-[#141925]">
              <Search className="mr-2.5 h-[17px] w-[17px] shrink-0 text-slate-500 transition-colors group-focus-within:text-blue-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  aria-label="Clear search"
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile navigation drawer */}
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation backdrop"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-130px)] overflow-y-auto border-t border-white/[0.08] bg-[#0B0D12] shadow-[0_25px_60px_rgba(0,0,0,0.65)] lg:hidden">
              <div className="PrimeBasket-container py-4">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Navigation
                  </p>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Prime Basket
                  </span>
                </div>

                <nav aria-label="Mobile navigation" className="space-y-1">
                  {navItems.map((item, index) => {
                    const active = isActive(item.to);
                    const Icon =
                      index === 0
                        ? ShoppingBag
                        : index === 1
                          ? Search
                          : index === 2
                            ? Package
                            : index === 3
                              ? Gift
                              : Headphones;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                          active
                            ? "border-blue-400/15 bg-blue-500/[0.09] text-blue-300"
                            : "border-transparent text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            active
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-white/[0.045] text-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        {item.to === "/support" && supportBadge}
                        {active ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Mobile cart */}
                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                      isActive("/cart")
                        ? "border-blue-400/15 bg-blue-500/[0.09] text-blue-300"
                        : "border-transparent text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <ShoppingCart className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      Shopping Cart
                    </span>
                    {totalItems > 0 && (
                      <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </Link>

                  {/* Mobile wishlist */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/wishlist");
                    }}
                    aria-label={`Wishlist, ${wishlistCount} saved products`}
                    className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-slate-300 transition hover:bg-rose-500/[0.07] hover:text-rose-300"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/[0.08] text-rose-400">
                      <Heart className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </nav>

                {/* Mobile account */}
                {user ? (
                  <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#11141B] p-3">
                    <div className="flex items-center gap-3 p-1">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-sm font-bold text-blue-300">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {fullName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/gift-cards"
                      onClick={() => setMenuOpen(false)}
                      className="mt-3 flex items-center gap-2.5 rounded-xl border border-blue-400/10 bg-blue-500/[0.06] px-3 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/[0.12]"
                    >
                      <Gift className="h-4 w-4" />
                      Gift Cards
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </Link>

                    {/* Mobile Support Center */}
                    <Link
                      to="/support"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/[0.07] px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05]"
                    >
                      <Headphones className="h-4 w-4 text-blue-400" />
                      <span className="flex-1">Support Center</span>
                      {supportBadge}
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {normalizeRole(user.role) === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="mt-2 flex items-center gap-2.5 rounded-xl border border-blue-400/15 bg-blue-500/[0.09] px-3 py-3 text-sm font-semibold text-blue-300"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-400 transition hover:bg-rose-500/[0.08]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.025] text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-500"
                    >
                      Create account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/[0.07] pt-4 text-[10px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  A smoother shopping experience
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
};

export default Navbar;
