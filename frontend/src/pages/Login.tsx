import { LoginForm } from "@/components/login-form";
import {
ArrowLeft,
ArrowRight,
CheckCircle2,
ShieldCheck,
ShoppingBag,
Sparkles,
Truck,
} from "lucide-react";
import { Link } from "react-router";

const Login = () => {
return ( <main className="min-h-screen overflow-hidden bg-[#0a0f19] text-white"> <div className="grid min-h-screen lg:grid-cols-2">
{/* Left: Login form */} <section className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-14 xl:px-20"> <div className="pointer-events-none absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-blue-500/[0.08] blur-[100px]" />

      {/* Brand */}
      <header className="relative flex items-center justify-between gap-4">
        <Link
          to="/"
          className="group inline-flex items-center gap-3"
          aria-label="Prime Basket home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition group-hover:bg-blue-400">
            <ShoppingBag size={22} strokeWidth={2.2} />
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-white">
              Prime<span className="text-blue-400"> Basket</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Shopping, elevated
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-400/30 hover:text-white sm:text-sm"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Back to store</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </header>

      {/* Form */}
      <div className="relative flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3 py-1.5 text-xs font-medium text-blue-300">
              <Sparkles size={14} />
              Welcome back
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sign in to your
              <span className="mt-1 block text-blue-400">
                account.
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400 sm:text-base">
              Pick up where you left off. Your favorite products and
              orders are just a step away.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-[#101827] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <LoginForm />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-blue-400"
            />
            <div>
              <p className="text-sm font-medium text-slate-200">
                Your account matters
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sign in through the secure authentication flow configured
                for your Prime Basket account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Prime Basket</p>
        <p className="flex items-center gap-2">
          Made for a better shopping experience
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        </p>
      </footer>
    </section>

    {/* Right: Brand visual */}
    <section className="relative hidden min-h-screen overflow-hidden border-l border-white/[0.06] bg-[#0d1422] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/[0.12] blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-500/[0.10] blur-[100px]" />

      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The Prime Basket experience
        </span>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-400">
          <Sparkles size={19} />
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-lg py-12">
        {/* Visual illustration */}
        <div className="relative mx-auto mb-10 flex aspect-square max-h-[390px] w-full max-w-[390px] items-center justify-center">
          <div className="absolute inset-[7%] rounded-full border border-blue-400/15" />
          <div className="absolute inset-[17%] rounded-full border border-blue-400/20" />
          <div className="absolute inset-[27%] rounded-full border border-blue-400/25" />

          <div className="absolute inset-[12%] animate-[spin_35s_linear_infinite] rounded-full border border-dashed border-white/10" />

          <div className="absolute left-[9%] top-[27%] flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-[#111d30] text-blue-300 shadow-lg shadow-blue-500/10">
            <ShoppingBag size={22} />
          </div>

          <div className="absolute right-[8%] top-[35%] flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-[#171a32] text-indigo-300 shadow-lg shadow-indigo-500/10">
            <Sparkles size={21} />
          </div>

          <div className="absolute bottom-[17%] left-[18%] flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-[#102522] text-emerald-300">
            <CheckCircle2 size={21} />
          </div>

          <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-[2.5rem] border border-blue-400/25 bg-gradient-to-br from-blue-500/20 via-[#111d30] to-[#111827] shadow-2xl shadow-blue-950/40 sm:h-52 sm:w-52">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-300/20 bg-blue-400/10 text-blue-300 sm:h-24 sm:w-24">
              <ShoppingBag
                size={46}
                strokeWidth={1.4}
              />
            </div>

            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Prime Basket
            </span>
          </div>

          <div className="absolute right-[4%] top-[9%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.8)]" />
          <div className="absolute bottom-[10%] right-[19%] h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(129,140,248,0.8)]" />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Your next favorite
            <br />
            <span className="text-blue-400">is waiting.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400">
            Discover products you love, manage your purchases and enjoy
            a smoother shopping experience—all in one place.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Feature icon={<ShoppingBag size={18} />} label="Discover" />
          <Feature icon={<ShieldCheck size={18} />} label="Shop with care" />
          <Feature icon={<Truck size={18} />} label="Track orders" />
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/[0.07] pt-5">
        <p className="text-xs text-slate-500">
          A smarter way to shop.
        </p>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 transition hover:text-blue-200"
        >
          Explore collection
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  </div>
</main>


);
};

const Feature = ({
icon,
label,
}: {
icon: React.ReactNode;
label: string;
}) => (

  <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2 py-4 text-center">
    <span className="text-blue-400">{icon}</span>
    <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
      {label}
    </span>
  </div>
);

export default Login;
