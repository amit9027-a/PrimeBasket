import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

const Footer = () => {
  const footerColumns = [
    {
      title: "Shop",
      links: [
        "All Products",
        "Footwear",
        "Bags",
        "Accessories",
        "Home",
      ],
    },
    {
      title: "Company",
      links: [
        "About Us",
        "Our Story",
        "Careers",
        "Journal",
        "Contact",
      ],
    },
    {
      title: "Support",
      links: [
        "Shipping",
        "Returns",
        "FAQ",
        "Size Guide",
        "Help Center",
      ],
    },
    {
      title: "Account",
      links: [
        "My Account",
        "My Orders",
        "Wishlist",
        "Cart",
        "Track Order",
      ],
    },
  ];

  const features = [
    {
      icon: <Truck size={19} strokeWidth={1.5} />,
      title: "Fast Delivery",
      description: "Quick & reliable shipping",
    },
    {
      icon: <ShieldCheck size={19} strokeWidth={1.5} />,
      title: "Secure Shopping",
      description: "Your data is protected",
    },
    {
      icon: <RotateCcw size={19} strokeWidth={1.5} />,
      title: "Easy Returns",
      description: "Simple return process",
    },
    {
      icon: <CreditCard size={19} strokeWidth={1.5} />,
      title: "Secure Payment",
      description: "100% safe transactions",
    },
  ];

  return (
    <footer className="bg-ink text-paper">

      {/* ================================
          TRUST FEATURES
      ================================= */}
      <div className="border-b border-[rgba(245,243,236,0.12)]">
        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(245,243,236,0.16)] flex items-center justify-center text-brass-light">
                  {feature.icon}
                </div>

                <div>
                  <h4 className="font-body text-[13px] font-medium text-[#E8E5DA]">
                    {feature.title}
                  </h4>

                  <p className="font-body text-[11px] mt-0.5 text-[#817D70]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>


      {/* ================================
          MAIN FOOTER
      ================================= */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-14">

          {/* BRAND SECTION */}
          <div>

            <div className="font-display text-2xl font-semibold tracking-tight mb-4">
              PrimeBasket
            </div>

            <p className="font-body text-[13px] leading-[1.8] text-[#948F80] max-w-70">
              Discover quality products, everyday essentials and
              timeless choices — all in one basket.
            </p>


            {/* SOCIAL LINKS */}
            <div className="mt-6">

              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brass-light mb-3">
                Follow PrimeBasket
              </p>

              <div className="flex items-center gap-2.5">

                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-[rgba(245,243,236,0.15)] flex items-center justify-center text-[10px] font-medium text-[#BDB9AA] hover:text-white hover:border-[#BDB9AA] transition-all duration-200"
                >
                  IG
                </a>

                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-[rgba(245,243,236,0.15)] flex items-center justify-center text-[10px] font-medium text-[#BDB9AA] hover:text-white hover:border-[#BDB9AA] transition-all duration-200"
                >
                  IN
                </a>

                <a
                  href="#"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-full border border-[rgba(245,243,236,0.15)] flex items-center justify-center text-[10px] font-medium text-[#BDB9AA] hover:text-white hover:border-[#BDB9AA] transition-all duration-200"
                >
                  GH
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full border border-[rgba(245,243,236,0.15)] flex items-center justify-center text-[10px] font-medium text-[#BDB9AA] hover:text-white hover:border-[#BDB9AA] transition-all duration-200"
                >
                  YT
                </a>

              </div>

            </div>

          </div>


          {/* FOOTER COLUMNS */}
          {footerColumns.map((column) => (

            <div key={column.title}>

              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-brass-light mb-5">
                {column.title}
              </div>

              <ul className="list-none p-0 m-0 space-y-3">

                {column.links.map((link) => (

                  <li key={link}>

                    <a
                      href="#"
                      className="group inline-flex items-center gap-1 font-body text-[13px] text-[#C7C4B6] no-underline hover:text-white transition-colors duration-200"
                    >

                      {link}

                      <ArrowUpRight
                        size={11}
                        className="opacity-0 -translate-y-0.5 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200"
                      />

                    </a>

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </div>


        {/* ================================
            NEWSLETTER
        ================================= */}
        <div className="mt-14 pt-8 border-t border-[rgba(245,243,236,0.12)]">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <p className="font-display text-xl text-[#E8E5DA]">
                Stay in the loop.
              </p>

              <p className="font-body text-[12px] mt-1.5 text-[#817D70]">
                Get new arrivals, special offers and updates from
                PrimeBasket.
              </p>

            </div>


            <div className="flex w-full lg:w-auto">

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full lg:w-72 h-11 px-4 bg-transparent border border-[rgba(245,243,236,0.18)] text-[#E8E5DA] placeholder:text-[#6E6A5D] outline-none focus:border-[#948F80] font-body text-[12px]"
              />

              <button
                type="button"
                className="h-11 px-6 bg-paper text-ink font-body text-[11px] font-semibold tracking-wide hover:bg-[#DDD9CC] transition-colors duration-200"
              >
                SUBSCRIBE
              </button>

            </div>

          </div>

        </div>


        {/* ================================
            BOTTOM BAR
        ================================= */}
        <div className="mt-10 pt-6 border-t border-[rgba(245,243,236,0.12)] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

          <span className="font-mono text-[10px] tracking-[0.06em] text-[#6E6A5D]">
            © 2026 PRIMEBASKET — ALL RIGHTS RESERVED
          </span>


          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.06em] text-[#6E6A5D]">

            <a
              href="#"
              className="hover:text-[#C7C4B6] transition-colors"
            >
              PRIVACY
            </a>

            <a
              href="#"
              className="hover:text-[#C7C4B6] transition-colors"
            >
              TERMS
            </a>

            <a
              href="#"
              className="hover:text-[#C7C4B6] transition-colors"
            >
              COOKIES
            </a>

            <span>
              INDIA / INR ₹
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;