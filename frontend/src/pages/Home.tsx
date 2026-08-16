import React, { useMemo, useState } from "react";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Link } from "react-router";

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

function Button({
  children,
  variant = "solid",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  [key: string]: any;
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
  const variants: Record<
    "solid" | "outline" | "ghost",
    Record<string, string>
  > = {
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
      style={{ ...base, ...variants[variant as "solid" | "outline" | "ghost"] }}
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

const Home = () => {
  const [category, setCategory] = useState("All");
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
    <div className="bg-paper">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="fs-hero-grid max-w-7xl my-0 mx-auto py-0 px-6 grid md:grid-cols-2 gap-15 items-center min-h-140">
        <div>
          <div className="flex items-center gap-2.5 mb-7">
            <span className="font-mono text-xs tracking-[0.06em] text-moss">
              SPECIMEN No. 001 — AUTUMN CATALOGUE
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>

          <h1 className="font-display font-medium tracking-[-0.01em] text-ink m-0 mb-6 text-[clamp(40px,5vw,64px)] leading-[1.04]">
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
            Considered essentials, catalogued for daily use — footwear, bags and
            objects made to be kept, not replaced.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Button variant="solid">
              Shop the collection <ArrowRight size={15} strokeWidth={1.6} />
            </Button>
            <Button variant="outline">Read the journal</Button>
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
      </section>

      {/* ── Category rail ──────────────────────────────────── */}
      <section className="border-y border-line mt-18 bg-paper-alt">
        <div className="max-w-7xl mx-auto py-4.5 px-6 flex gap-2.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`fs-cat-btn font-body text-[12.5px] tracking-[0.03em] uppercase py-2.25 px-4.5 rounded-[20px] border ${category === cat ? "border-ink bg-ink text-paper" : "border-line bg-transparent text-ink-soft"} cursor-pointer whitespace-nowrap`}
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
          <Link
            to="/products"
            className="font-body text-[13px] text-ink flex items-center gap-1.5 border-b border-ink pb-0.5 no-underline"
          >
            View all <ArrowUpRight size={14} strokeWidth={1.6} />
          </Link>
        </div>

        <div className="fs-product-grid grid grid-cols-4 gap-y-7 gap-x-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── Manifesto strip ─────────────────────────────────── */}
      <section className="bg-moss py-24 px-6">
        <div className="max-w-190 mx-auto text-center">
          <span className="font-mono text-xs tracking-[0.08em] text-brass-light uppercase">
            Field notes, No. 3
          </span>
          <p className="font-display italic font-normal leading-11 text-moss-pale mt-5 mx-0 mb-7 text-[clamp(24px,3.4vw,36px)]">
            "We do not chase seasons. Every specimen is designed once, made
            well, and catalogued to be worn for a decade — not a quarter."
          </p>
          <span className="font-body text-[13px] text-[rgba(227,231,214,0.7)] tracking-[0.02em]">
            — Field Study Design Notes
          </span>
        </div>
      </section>

      {/* ── Editorial / bestsellers ─────────────────────────── */}
      <section className="fs-editorial-grid max-w-7xl mx-auto py-22 px-6 grid grid-cols-[0.9fr_1.1fr] gap-14 items-center">
        <div className="aspect-square overflow-hidden border border-line">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900&auto=format&fit=crop"
            alt="Workshop"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div>
          <span className="font-mono text-[11.5px] tracking-[0.06em] text-brass uppercase">
            From the workshop
          </span>
          <h2 className="font-display text-[32px] font-medium text-ink mt-3.5 mb-4.5 leading-[1.2]">
            Made in small runs,
            <br />
            logged by hand.
          </h2>
          <p className="font-body text-[15px] leading-[1.75] text-ink-soft max-w-110 mb-7">
            Each specimen is produced in batches of under 200, numbered in
            sequence and recorded in our paper ledger before it ever reaches a
            shelf. Scarcity here isn't a marketing device — it's a limit on how
            fast we're willing to work.
          </p>
          <Button variant="outline">
            Visit the journal <ArrowRight size={15} strokeWidth={1.6} />
          </Button>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-alt">
        <div className="max-w-7xl mx-auto py-14 px-6 flex justify-between items-center gap-8 flex-wrap">
          <div>
            <h3 className="font-display text-[22px] text-ink mb-1.5">
              Join the field notes
            </h3>
            <p className="font-body text-[13.5px] text-ink-faint m-0">
              New specimens and workshop dispatches, roughly once a month.
            </p>
          </div>
          {subscribed ? (
            <span className="font-mono text-[13px] text-moss">
              Logged. Welcome to the record.
            </span>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
              className="flex gap-0 min-w-85"
            >
              <input
                className="fs-input flex-1 font-body text-[13.5px] py-3.25 px-4 border border-line border-r-0 bg-card text-ink"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="solid" type="submit" className="rounded-none">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
