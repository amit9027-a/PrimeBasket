// @ts-nocheck
import React, { useState, useMemo } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ────────────────────────────────────────────────────────────────
   FIELD STUDY — design tokens
   A catalog aesthetic: paper, ink, moss, brass. Products are
   "specimens" — numbered, tagged, and catalogued.
   ──────────────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────────────
   Dummy product data — "specimens"
   ──────────────────────────────────────────────────────────────── */

const PRODUCTS = [
  {
    id: 1,
    no: "014",
    name: "Alder Low-Top Sneaker",
    category: "Footwear",
    price: 8900,
    colors: ["#E7E2D4", "#42502F"],
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    note: "Vegetable-tanned leather",
    tag: "New",
  },
  {
    id: 2,
    no: "022",
    name: "Field Canvas Tote",
    category: "Bags",
    price: 4200,
    colors: ["#D8CBB0", "#1B1A15"],
    img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop",
    note: "14oz waxed canvas",
  },
  {
    id: 3,
    no: "031",
    name: "Brass Field Watch",
    category: "Accessories",
    price: 12400,
    colors: ["#AD8A52"],
    img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop",
    note: "Solid brass, sapphire crystal",
    tag: "Limited",
  },
  {
    id: 4,
    no: "045",
    name: "Ash Ceramic Vessel",
    category: "Home",
    price: 2850,
    colors: ["#EDE9DF", "#8C8879"],
    img: "https://images.unsplash.com/photo-1602874801006-90d5c37f7e6c?q=80&w=800&auto=format&fit=crop",
    note: "Hand-thrown stoneware",
  },
  {
    id: 5,
    no: "052",
    name: "Study Leather Loafer",
    category: "Footwear",
    price: 9600,
    colors: ["#6B4A34", "#1B1A15"],
    img: "https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=800&auto=format&fit=crop",
    note: "Full-grain, hand-stitched",
  },
  {
    id: 6,
    no: "058",
    name: "Weekender Duffel",
    category: "Bags",
    price: 11200,
    colors: ["#42502F", "#8C8879"],
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    note: "Waxed canvas, leather trim",
    tag: "New",
  },
  {
    id: 7,
    no: "063",
    name: "Horn-Rim Sun Reader",
    category: "Accessories",
    price: 5400,
    colors: ["#1B1A15", "#6B4A34"],
    img: "https://images.unsplash.com/photo-1491637639811-60e2756cbb93?q=80&w=800&auto=format&fit=crop",
    note: "Acetate frame, UV400",
  },
  {
    id: 8,
    no: "071",
    name: "Bound Leather Card Case",
    category: "Accessories",
    price: 2100,
    colors: ["#6B4A34", "#1B1A15", "#AD8A52"],
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
    note: "Edge-painted, brass rivet",
  },
];

const CATEGORIES = ["All", "Footwear", "Bags", "Accessories", "Home"];

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ────────────────────────────────────────────────────────────────
   Small building blocks
   ──────────────────────────────────────────────────────────────── */

function CustomButton({
  children,
  variant = "solid",
  className = "",
  ...props
}) {
  const base = {
    fontFamily: FONTS.body,
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    padding: "13px 26px",
    borderRadius: "2px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 180ms ease",
    border: "1px solid transparent",
  };
  const variants = {
    solid: {
      background: TOKENS.ink,
      color: TOKENS.paper,
      borderColor: TOKENS.ink,
    },
    outline: {
      background: "transparent",
      color: TOKENS.ink,
      borderColor: TOKENS.ink,
    },
    ghost: {
      background: "transparent",
      color: TOKENS.paper,
      borderColor: "rgba(245,243,236,0.4)",
    },
  };
  return (
    <button
      className={className}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (variant === "solid")
          e.currentTarget.style.background = TOKENS.mossDark;
        if (variant === "outline") {
          e.currentTarget.style.background = TOKENS.ink;
          e.currentTarget.style.color = TOKENS.paper;
        }
        if (variant === "ghost")
          e.currentTarget.style.borderColor = TOKENS.paper;
      }}
      onMouseLeave={(e) => {
        if (variant === "solid") e.currentTarget.style.background = TOKENS.ink;
        if (variant === "outline") {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = TOKENS.ink;
        }
        if (variant === "ghost")
          e.currentTarget.style.borderColor = "rgba(245,243,236,0.4)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function SpecimenTag({ no }) {
  return (
    <div className="absolute top-3 bg-card-alt font-mono text-ink-soft left-3 border rounded-xs py-1 px-2 text-xs tracking-wide rotate-[-1.5deg] shadow-[0,1px,2px,rgba(27,26,21,0.06)] border-[1px,solid,${TOKENS.line}">
      No. {no}
    </div>
  );
}

function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col cursor-pointer"
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          background: TOKENS.paperAlt,
          overflow: "hidden",
          border: `1px solid ${TOKENS.line}`,
        }}
      >
        {!imgError ? (
          <img
            src={product.img}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hover ? "scale(1.045)" : "scale(1)",
              transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
              filter: hover ? "saturate(1.05)" : "saturate(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: TOKENS.mossPale,
              color: TOKENS.moss,
              fontFamily: FONTS.display,
              fontSize: "15px",
              fontStyle: "italic",
              textAlign: "center",
              padding: "20px",
            }}
          >
            {product.name}
          </div>
        )}

        <SpecimenTag no={product.no} />

        {product.tag && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: TOKENS.moss,
              color: TOKENS.mossPale,
              fontFamily: FONTS.mono,
              fontSize: "10px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 8px",
              borderRadius: "2px",
            }}
          >
            {product.tag}
          </div>
        )}

        <button
          aria-label="Add to wishlist"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(251,250,246,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hover ? 1 : 0,
            transform: hover ? "translateY(0)" : "translateY(6px)",
            transition: "all 220ms ease",
            cursor: "pointer",
          }}
        >
          <Heart size={15} color={TOKENS.ink} strokeWidth={1.6} />
        </button>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "9px 12px",
            background: "rgba(27,26,21,0.88)",
            color: TOKENS.paper,
            fontFamily: FONTS.body,
            fontSize: "11.5px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transform: hover ? "translateY(0)" : "translateY(100%)",
            transition: "transform 260ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span>Quick add</span>
          <Plus size={13} strokeWidth={1.6} />
        </div>
      </div>

      <div style={{ paddingTop: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "8px",
          }}
        >
          <h3
            style={{
              fontFamily: FONTS.display,
              fontSize: "16px",
              fontWeight: 500,
              color: TOKENS.ink,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13.5px",
              color: TOKENS.ink,
              whiteSpace: "nowrap",
            }}
          >
            {formatPrice(product.price)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "12.5px",
              color: TOKENS.inkFaint,
              margin: 0,
            }}
          >
            {product.note}
          </p>
          <div style={{ display: "flex", gap: "5px" }}>
            {product.colors.map((c, i) => (
              <span
                key={i}
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: c,
                  border: `1px solid ${TOKENS.line}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */

export default function Home() {
  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = useMemo(
    () =>
      category === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === category),
    [category],
  );

  return (
    <div style={{ background: TOKENS.paper, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .fs-root { -webkit-font-smoothing: antialiased; }
        .fs-nav-link { position: relative; }
        .fs-nav-link::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -4px;
          height: 1px; background: ${TOKENS.ink}; transform: scaleX(0);
          transform-origin: left; transition: transform 220ms ease;
        }
        .fs-nav-link:hover::after { transform: scaleX(1); }
        .fs-cat-btn { transition: all 180ms ease; }
        .fs-input:focus { outline: 2px solid ${TOKENS.moss}; outline-offset: 2px; }
        a, button { font-family: inherit; }
        ::selection { background: ${TOKENS.mossPale}; color: ${TOKENS.mossDark}; }
      `}</style>

      <div className="fs-root" style={{ fontFamily: FONTS.body }}>
        {/* ── Utility bar ─────────────────────────────────────── */}
        {/* <div
          style={{
            background: TOKENS.ink,
            color: TOKENS.inkFaint,
            fontFamily: FONTS.mono,
            fontSize: "11px",
            letterSpacing: "0.04em",
            padding: "8px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#C7C4B6" }}>
            FREE SHIPPING ON ORDERS OVER ₹5,000 — SHIPS WORLDWIDE
          </span>
          <span style={{ display: "none" }} className="fs-desktop-only">
            EN &nbsp;/&nbsp; INR ₹
          </span>
        </div> */}

        {/* ── Header ──────────────────────────────────────────── */}
        {/* <header
          style={{
            borderBottom: `1px solid ${TOKENS.line}`,
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: TOKENS.paper,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: TOKENS.ink,
              }}
            >
              FIELD STUDY
            </div>

            <nav
              style={{
                display: "flex",
                gap: "36px",
                fontSize: "13px",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: TOKENS.ink,
              }}
              className="fs-desktop-nav"
            >
              {["Shop", "Journal", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="fs-nav-link"
                  style={{ textDecoration: "none", color: TOKENS.ink }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
              <div style={{ position: "relative", cursor: "pointer" }}>
                <ShoppingBag size={18} strokeWidth={1.5} color={TOKENS.ink} />
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-9px",
                    background: TOKENS.moss,
                    color: TOKENS.mossPale,
                    fontSize: "9.5px",
                    fontFamily: FONTS.mono,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  2
                </span>
              </div>
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
        </header> */}

        {/* ── Hero ────────────────────────────────────────────── */}
        {/* <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
            minHeight: "560px",
          }}
          className="fs-hero-grid"
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  color: TOKENS.moss,
                }}
              >
                SPECIMEN No. 001 — AUTUMN CATALOGUE
              </span>
              <span
                style={{ flex: 1, height: "1px", background: TOKENS.line }}
              />
            </div>

            <h1
              style={{
                fontFamily: FONTS.display,
                fontSize: "clamp(40px, 5vw, 64px)",
                lineHeight: 1.04,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: TOKENS.ink,
                margin: "0 0 24px",
              }}
            >
              A study in
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                quiet
              </span>{" "}
              objects.
            </h1>

            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "16px",
                lineHeight: 1.7,
                color: TOKENS.inkSoft,
                maxWidth: "420px",
                margin: "0 0 36px",
              }}
            >
              Considered essentials, catalogued for daily use — footwear, bags
              and objects made to be kept, not replaced.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <CustomButton variant="solid">
                Shop the collection <ArrowRight size={15} strokeWidth={1.6} />
              </CustomButton>
              <CustomButton variant="outline">Read the journal</CustomButton>
            </div>

            <div
              style={{
                display: "flex",
                gap: "36px",
                marginTop: "52px",
                paddingTop: "28px",
                borderTop: `1px solid ${TOKENS.line}`,
              }}
            >
              {[
                ["120+", "Specimens catalogued"],
                ["48", "Countries shipped to"],
                ["12yr", "Average product life"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: "24px",
                      color: TOKENS.ink,
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: "11.5px",
                      color: TOKENS.inkFaint,
                      marginTop: "2px",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: "-24px",
                backgroundImage: `linear-gradient(${TOKENS.line} 1px, transparent 1px), linear-gradient(90deg, ${TOKENS.line} 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
                opacity: 0.5,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                aspectRatio: "4 / 5",
                overflow: "hidden",
                border: `1px solid ${TOKENS.line}`,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1520256788954-3a89a0d9dc0f?q=80&w=1000&auto=format&fit=crop"
                alt="Featured specimen"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-18px",
                left: "-18px",
                zIndex: 2,
                background: TOKENS.card,
                border: `1px solid ${TOKENS.line}`,
                padding: "14px 18px",
                fontFamily: FONTS.mono,
                fontSize: "11px",
                color: TOKENS.inkSoft,
                boxShadow: "0 4px 14px rgba(27,26,21,0.08)",
              }}
            >
              Fig. 1 — Alder Low-Top, Moss colorway
            </div>
          </div>
        </section> */}

        {/* ── Category rail ──────────────────────────────────── */}
        <section
          style={{
            borderTop: `1px solid ${TOKENS.line}`,
            borderBottom: `1px solid ${TOKENS.line}`,
            marginTop: "72px",
            background: TOKENS.paperAlt,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "18px 24px",
              display: "flex",
              gap: "10px",
              overflowX: "auto",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="fs-cat-btn"
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "12.5px",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  padding: "9px 18px",
                  borderRadius: "20px",
                  border: `1px solid ${category === cat ? TOKENS.ink : TOKENS.line}`,
                  background: category === cat ? TOKENS.ink : "transparent",
                  color: category === cat ? TOKENS.paper : TOKENS.inkSoft,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Product grid ───────────────────────────────────── */}
        <section className="max-w-7xl my-0 mx-auto pt-14 px-6 pb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-display text-[28px] font-medium text-ink m-0">
                The catalogue
              </h2>
              <p className="font-body text-[13px] text-ink-faint m-0 mt-1">
                {filtered.length} specimens{" "}
                {category !== "All" ? `in ${category}` : "on record"}
              </p>
            </div>
            <a
              href="#"
              className="font-body text-[13px] text-ink flex items-center gap-1.5 border-b border-ink pb-0.5 no-underline"
            >
              View all <ArrowUpRight size={14} strokeWidth={1.6} />
            </a>
          </div>

          <div className="fs-product-grid grid grid-cols-4 gap-y-7 gap-x-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── Manifesto strip ─────────────────────────────────── */}
        <section className="bg-moss py-24 px-6">
          <div
            style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}
          >
            <span className="font-mono text-xs tracking-[0.08em] text-brass-light uppercase">
              Field notes, No. 3
            </span>
            <p
              className="font-display italic font-normal leading-11 text-moss-pale mt-5 mx-0 mb-7"
              style={{
                fontSize: "clamp(24px, 3.4vw, 36px)",
              }}
            >
              "We do not chase seasons. Every specimen is designed once, made
              well, and catalogued to be worn for a decade — not a quarter."
            </p>
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: "13px",
                color: "rgba(227,231,214,0.7)",
                letterSpacing: "0.02em",
              }}
            >
              — Field Study Design Notes
            </span>
          </div>
        </section>

        {/* ── Editorial / bestsellers ─────────────────────────── */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "88px 24px",
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="fs-editorial-grid"
        >
          <div
            style={{
              aspectRatio: "1 / 1",
              overflow: "hidden",
              border: `1px solid ${TOKENS.line}`,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900&auto=format&fit=crop"
              alt="Workshop"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                letterSpacing: "0.06em",
                color: TOKENS.brass,
                textTransform: "uppercase",
              }}
            >
              From the workshop
            </span>
            <h2
              style={{
                fontFamily: FONTS.display,
                fontSize: "32px",
                fontWeight: 500,
                color: TOKENS.ink,
                margin: "14px 0 18px",
                lineHeight: 1.2,
              }}
            >
              Made in small runs,
              <br />
              logged by hand.
            </h2>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: "15px",
                lineHeight: 1.75,
                color: TOKENS.inkSoft,
                maxWidth: "440px",
                margin: "0 0 28px",
              }}
            >
              Each specimen is produced in batches of under 200, numbered in
              sequence and recorded in our paper ledger before it ever reaches a
              shelf. Scarcity here isn't a marketing device — it's a limit on
              how fast we're willing to work.
            </p>
            <Button variant="outline">
              Visit the journal <ArrowRight size={15} strokeWidth={1.6} />
            </Button>
          </div>
        </section>

        {/* ── Newsletter ──────────────────────────────────────── */}
        <section
          style={{
            borderTop: `1px solid ${TOKENS.line}`,
            borderBottom: `1px solid ${TOKENS.line}`,
            background: TOKENS.paperAlt,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "56px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: FONTS.display,
                  fontSize: "22px",
                  color: TOKENS.ink,
                  margin: "0 0 6px",
                }}
              >
                Join the field notes
              </h3>
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "13.5px",
                  color: TOKENS.inkFaint,
                  margin: 0,
                }}
              >
                New specimens and workshop dispatches, roughly once a month.
              </p>
            </div>
            {subscribed ? (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  color: TOKENS.moss,
                }}
              >
                Logged. Welcome to the record.
              </span>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
                style={{ display: "flex", gap: "0", minWidth: "340px" }}
              >
                <input
                  className="fs-input"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    fontFamily: FONTS.body,
                    fontSize: "13.5px",
                    padding: "13px 16px",
                    border: `1px solid ${TOKENS.line}`,
                    borderRight: "none",
                    background: TOKENS.card,
                    color: TOKENS.ink,
                  }}
                />
                <Button
                  variant="solid"
                  type="submit"
                  style={{ borderRadius: 0 }}
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        {/* <footer
          style={{
            background: TOKENS.ink,
            color: TOKENS.paper,
            padding: "64px 24px 28px",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: "40px",
            }}
            className="fs-footer-grid"
          >
            <div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                FIELD STUDY
              </div>
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "#948F80",
                  maxWidth: "260px",
                }}
              >
                Considered objects, catalogued for everyday use. Est. in a small
                workshop, still run the same way.
              </p>
            </div>

            {[
              {
                title: "Shop",
                links: ["Footwear", "Bags", "Accessories", "Home"],
              },
              {
                title: "Studio",
                links: ["About", "Journal", "Workshop", "Careers"],
              },
              {
                title: "Support",
                links: ["Shipping", "Returns", "Size guide", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: TOKENS.brassLight,
                    marginBottom: "16px",
                  }}
                >
                  {col.title}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((l) => (
                    <li key={l} style={{ marginBottom: "10px" }}>
                      <a
                        href="#"
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: "13.5px",
                          color: "#C7C4B6",
                          textDecoration: "none",
                        }}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="max-w-7xl mt-12 mx-auto mb-0 pt-6 flex flex-wrap gap-2.5 justify-between font-mono text-xs"
            style={{
              borderTop: "1px solid rgba(245,243,236,0.14)",
              color: "#6E6A5D",
            }}
          >
            <span>© 2026 FIELD STUDY STUDIO — ALL SPECIMENS CATALOGUED</span>
            <span>PRIVACY — TERMS — INDIA / INR ₹</span>
          </div>
        </footer> */}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .fs-hero-grid { grid-template-columns: 1fr !important; min-height: auto !important; padding-top: 40px !important; padding-bottom: 40px !important; }
          .fs-product-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fs-editorial-grid { grid-template-columns: 1fr !important; }
          .fs-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .fs-desktop-nav { display: none !important; }
        }
        @media (max-width: 560px) {
          .fs-product-grid { grid-template-columns: 1fr 1fr !important; gap: 18px 14px !important; }
          .fs-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
