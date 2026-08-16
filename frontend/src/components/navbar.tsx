import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCart } from "@/features/cart/cartThunks";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const totalItems = useAppSelector((state) => state.cart.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    dispatch(fetchCart()).catch(() => {
      // Keep the navigation resilient if the cart API is temporarily unavailable.
    });
  }, [dispatch, user]);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "Orders", to: "/orders" },
    { label: "Cart", to: "/cart" },
  ];

  return (
    <>
      <div className="bg-ink text-ink-faint font-mono text-[11px] tracking-[0.04em] py-2 px-6 flex justify-between items-center">
        <span className="text-[#C7C4B6]">
          FREE SHIPPING ON ORDERS OVER ₹5,000 — SHIPS WORLDWIDE
        </span>
        <span className="fs-desktop-only hidden">EN &nbsp;/&nbsp; INR ₹</span>
      </div>
      <header className="border-b border-line sticky top-0 z-30 bg-paper">
        <div className="max-w-7xl mx-auto my-0 px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-[0.01em] text-ink no-underline"
          >
            PrimeBasket
          </Link>

          <nav className="fs-desktop-nav flex gap-9 text-[13px] tracking-[0.03em] uppercase text-ink">
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} className="fs-nav-link text-ink">
                {item.label}
              </Link>
            ))}
            {user?.role === "ADMIN" ? (
              <Link to="/admin/products/create" className="fs-nav-link text-moss">
                Create Product
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-5">
            <Search
              size={18}
              strokeWidth={1.5}
              color={TOKENS.ink}
              style={{ cursor: "pointer" }}
            />
            <Heart
              size={18}
              strokeWidth={1.5}
              color={TOKENS.ink}
              style={{ cursor: "pointer" }}
            />
            <Link to="/cart" className="relative cursor-pointer">
              <ShoppingBag size={18} strokeWidth={1.5} color={TOKENS.ink} />
              <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-moss px-1 text-[9.5px] font-mono text-moss-pale">
                {totalItems}
              </span>
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => logout()}
                className="hidden border border-line px-4 py-2 font-mono text-[11px] tracking-[0.08em] uppercase text-ink md:inline-flex"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden border border-line px-4 py-2 font-mono text-[11px] tracking-[0.08em] uppercase text-ink md:inline-flex"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "none",
              }}
              className="fs-mobile-toggle"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-line bg-paper px-6 py-5 md:hidden">
            <nav className="flex flex-col gap-4 font-mono text-[12px] tracking-[0.08em] uppercase">
              {navItems.map((item) => (
                <Link key={item.label} to={item.to} className="text-ink" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {user?.role === "ADMIN" ? (
                <Link
                  to="/admin/products/create"
                  className="text-moss"
                  onClick={() => setMenuOpen(false)}
                >
                  Create Product
                </Link>
              ) : null}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-fit text-left text-ink"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="text-ink" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
};

export default Navbar;
