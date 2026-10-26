import { useState, type FormEvent } from "react";
import {
ArrowRight,
ArrowUpRight,
CheckCircle2,
CreditCard,
Heart,
Camera,
BriefcaseBusiness,
Mail,
Package,
RotateCcw,
ShieldCheck,
ShoppingBag,
Truck,
} from "lucide-react";
import { Link } from "react-router";

const footerColumns = [
{
title: "Explore",
links: [
{ label: "All Products", to: "/products" },
{ label: "New Arrivals", to: "/products" },
{ label: "Popular Products", to: "/products" },
{ label: "Shopping Cart", to: "/cart" },
],
},
{
title: "Your Account",
links: [
{ label: "Sign In", to: "/login" },
{ label: "Create Account", to: "/signup" },
{ label: "My Orders", to: "/orders" },
{ label: "Wishlist", to: "/wishlist" },
],
},
{
title: "Customer Care",
links: [
{ label: "Contact Support", to: "/contact" },
{ label: "Shipping Information", to: "/shipping" },
{ label: "Returns & Refunds", to: "/returns" },
{ label: "Frequently Asked Questions", to: "/faq" },
],
},
];

const trustFeatures = [
{
icon: Truck,
title: "Reliable Delivery",
description: "Convenient shopping, delivered",
},
{
icon: ShieldCheck,
title: "Secure Shopping",
description: "Your account matters",
},
{
icon: RotateCcw,
title: "Customer First",
description: "Support when you need it",
},
{
icon: CreditCard,
title: "Secure Checkout",
description: "A smooth payment experience",
},
];

const socialLinks = [
{
label: "Instagram",
icon: Camera,
href: "https://www.instagram.com/",
},
{
label: "LinkedIn",
icon: BriefcaseBusiness,
href: "https://www.linkedin.com/",
},
];

const Footer = () => {
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();

if (!email.trim()) {
  setMessage("Please enter your email address.");
  return;
}

setMessage(
  "Thanks for your interest! Newsletter subscriptions are not connected yet."
);

};

return ( <footer className="relative mt-16 overflow-hidden border-t border-white/[0.08] bg-[#080b12] text-slate-200">
{/* Ambient background */} <div
     aria-hidden="true"
     className="pointer-events-none absolute -top-40 left-1/4 h-72 w-72 rounded-full bg-blue-600/[0.10] blur-[100px]"
   /> <div
     aria-hidden="true"
     className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-indigo-500/[0.07] blur-[100px]"
   />

  {/* Trust features */}
  <div className="relative border-b border-white/[0.08]">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-8 lg:px-10 lg:py-10">
      {trustFeatures.map((feature) => {
        const Icon = feature.icon;

        return (
          <div key={feature.title} className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09] text-blue-300 transition-colors duration-200 hover:border-blue-400/40 hover:bg-blue-500/[0.15]">
              <Icon size={20} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-slate-100">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Main footer */}
  <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
      {/* Brand */}
      <div>
        <Link
          to="/"
          aria-label="Prime Basket home"
          className="group inline-flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/25 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-300 shadow-lg shadow-blue-950/20 transition-transform duration-200 group-hover:scale-105">
            <ShoppingBag size={22} strokeWidth={1.8} />
          </span>

          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Prime<span className="text-blue-400">Basket</span>
          </span>
        </Link>

        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
          Discover everyday essentials and products you'll love. A smarter,
          more convenient way to explore your next favourite find.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.45)]" />
          Made for better everyday shopping
        </div>

        {/* Social links */}
        <div className="mt-7">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Find us online
          </p>

          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-slate-400 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  <Icon size={18} strokeWidth={1.7} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation columns */}
      {footerColumns.map((column) => (
        <div key={column.title}>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-100">
            {column.title}
          </h3>

          <ul className="m-0 list-none space-y-3.5 p-0">
            {column.links.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-blue-300"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Newsletter */}
    <div className="mt-14 overflow-hidden rounded-2xl border border-blue-400/[0.16] bg-gradient-to-br from-blue-500/[0.10] via-[#111827] to-indigo-500/[0.06] p-5 sm:p-7 lg:mt-16 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
            <Mail size={15} />
            prime Basket updates
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Good finds. Straight to your inbox.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Stay informed about new arrivals, product updates and shopping
            highlights.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="w-full lg:max-w-md">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>

            <input
              id="footer-newsletter-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              placeholder="Enter your email address"
              className="h-12 min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-[#080b12]/80 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
            />

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-200 hover:bg-blue-400 active:scale-[0.98]"
            >
              Subscribe
              <ArrowRight size={16} />
            </button>
          </div>

          <p
            aria-live="polite"
            className="mt-2 min-h-5 text-xs leading-5 text-slate-400"
          >
            {message ||
              "No spam — just useful shopping updates when available."}
          </p>
        </form>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="mt-9 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Prime Basket.</span>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <span>All rights reserved.</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-400">
        <Link to="/" className="transition-colors hover:text-blue-300">
          Home
        </Link>

        <Link
          to="/products"
          className="transition-colors hover:text-blue-300"
        >
          Products
        </Link>

        <Link
          to="/orders"
          className="transition-colors hover:text-blue-300"
        >
          Orders
        </Link>

        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <Package size={14} />
          India · INR ₹
        </span>
      </div>
    </div>

    {/* Footer signature */}
    <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600">
      <Heart size={12} className="text-blue-400" />
      Built with care for better shopping.
      <CheckCircle2 size={12} className="text-blue-400" />
    </div>
  </div>
</footer>

);
};

export default Footer;
