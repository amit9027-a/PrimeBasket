import { Route, Routes } from "react-router";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Navbar from "./components/navbar";
import Signup from "./pages/Signup";
import CreateProduct from "./pages/CreateProduct";
import AdminRoute from "./routes/AdminRoute";
import Footer from "./components/footer";
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

const App = () => {
  return (
    <div className="antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
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
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              {/* <Home2 /> */}
            </>
          }
        />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin/products/create"
          element={
            <AdminRoute>
              <CreateProduct />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />

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
};

export default App;
