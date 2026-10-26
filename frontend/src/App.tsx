
import { Route, Routes } from "react-router";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateProduct from "./pages/CreateProduct";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import GiftCards from "./pages/GiftCards";
import Support from "./pages/Support";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AdminRoute from "./routes/AdminRoute";

const App = () => {
  return (
    <div className="min-h-screen bg-[#0a0f19] text-white antialiased">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        a, button {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          cursor: not-allowed;
        }

        img {
          max-width: 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <Navbar />

      <main className="min-h-[60vh]">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Products */}
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          {/* Shopping */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Gift Cards */}
          <Route path="/gift-cards" element={<GiftCards />} />

          {/* Customer Support */}
          <Route path="/support" element={<Support />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Create Product */}
          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />

          {/* Unauthorized Access */}
          <Route
            path="/unauthorized"
            element={
              <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-red-500/10 text-4xl">
                  !
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Aestro Mart Security
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Access Denied
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
                  Your account does not have permission to
                  access this page. Please sign in with an
                  authorized administrator account.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href="/"
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                  >
                    Back to Home
                  </a>

                  <a
                    href="/login"
                    className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                  >
                    Sign In
                  </a>
                </div>
              </section>
            }
          />

          {/* Page Not Found */}
          <Route
            path="*"
            element={
              <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Aestro Mart
                </p>

                <h1 className="mt-4 text-6xl font-bold">
                  404
                </h1>

                <p className="mt-3 text-slate-400">
                  Sorry, this page could not be found.
                </p>

                <a
                  href="/"
                  className="mt-7 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-400"
                >
                  Return Home
                </a>
              </section>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
