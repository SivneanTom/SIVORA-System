import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { categoryAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, Heart, Package, LayoutDashboard, UserCircle, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const IconBtn = ({ to, onClick, title, children, extra = "" }) => {
  const cls = `group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 ${extra}`;
  return to
    ? <Link to={to} className={cls} title={title}>{children}</Link>
    : <button onClick={onClick} className={cls} title={title}>{children}</button>;
};

const iconCls = "text-white group-hover:scale-110 transition-transform";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const { isLoggedIn, isAdmin, logout, user } = useAuth();
  // const { cartCount } = useCart();
  const { cartCount, clearCart } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const activeCatId = sp.get('category_id') || '';

  useEffect(() => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data?.data ?? res.data ?? []))
      .catch(err => console.error("Category Error:", err));
  }, []);

  // const handleLogout = () => { logout(); setDropOpen(false); nav("/"); };
  const handleLogout = () => {
  clearCart();
  logout();
  setDropOpen(false);
  nav("/");
};

  const navLinkCls = (path) =>
    `text-[12px] font-medium tracking-[0.2em] uppercase transition-all duration-300 ${
      loc.pathname === path ? "text-white border-b-2 border-white pb-1" : "text-white/80 hover:text-white"
    }`;

  const mobileNavCls = (path) =>
    `text-sm tracking-widest uppercase transition-colors ${
      loc.pathname === path ? "text-red-600 font-semibold" : "text-gray-700 hover:text-red-600"
    }`;

  const dropItemCls = "flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100";

  const CartBadge = ({ small }) => cartCount > 0 && (
    <span className={`absolute ${small ? "-top-2 -right-2 text-[8px] w-4 h-4" : "-top-1 -right-1 text-[10px] w-5 h-5"} bg-white text-red-600 flex items-center justify-center rounded-full font-bold shadow-lg`}>
      {small ? cartCount : cartCount > 9 ? "9+" : cartCount}
    </span>
  );

  // Active style for dropdown category links
  const catLinkCls = (id) =>
    `block px-5 py-2 text-sm transition-colors ${
      activeCatId === String(id)
        ? 'bg-red-50 text-red-600 font-semibold border-l-2 border-red-600'
        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
    }`;

  // All Products active when on /shop with no category
  const allProductsCls = `block px-5 py-2 text-sm font-medium transition-colors ${
    loc.pathname === '/shop' && !activeCatId
      ? 'bg-red-50 text-red-600 font-semibold border-l-2 border-red-600'
      : 'text-gray-800 hover:bg-red-50 hover:text-red-600'
  }`;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-red-600 to-red-500 border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none flex-shrink-0">
          <span className="text-white tracking-[0.1em] uppercase font-semibold">SIVORA</span>
          <span className="text-[9px] tracking-[0.65em] text-white/80 uppercase mt-1">Fashion</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(({ label, path }) => (
            <Link key={path} to={path} className={navLinkCls(path)}>{label}</Link>
          ))}

          {/* Shop Dropdown */}
          <div className="relative group">
            <Link to="/shop" className={`flex items-center gap-1 ${navLinkCls("/shop")}`}>
              Shop
            </Link>
            <div className="absolute left-0 top-full hidden group-hover:block min-w-[240px] bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100">
              <Link to="/shop" className={allProductsCls}>All Products</Link>
              <div className="border-t my-1" />
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category_id=${cat.id}`} className={catLinkCls(cat.id)}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <IconBtn onClick={() => nav("/shop")} title="Search">
            <Search size={19} strokeWidth={1.6} className={iconCls} />
          </IconBtn>

          {isLoggedIn && (
            <IconBtn to="/wishlist" title="Wishlist" extra="hover:bg-pink-500/20">
              <Heart size={19} strokeWidth={1.6} className={iconCls} />
            </IconBtn>
          )}

          {/* <IconBtn to="/cart" title="Cart"> */}
          <IconBtn
  onClick={() => {
    if (!isLoggedIn) {
      nav("/login", {
        state: {
          from: "/cart"
        }
      });
      return;
    }

    nav("/cart");
  }}
  title="Cart"
>
            <div className="relative">
              <ShoppingBag size={19} strokeWidth={1.6} className={iconCls} />
              <CartBadge />
            </div>
          </IconBtn>

          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-red-600 font-bold shadow-lg hover:scale-105 transition">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </button>

              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-20 py-2 overflow-hidden">
                    {isAdmin && <Link to="/admin" onClick={() => setDropOpen(false)} className={dropItemCls}><LayoutDashboard size={18} /> Admin Panel</Link>}
                    <Link to="/orders" onClick={() => setDropOpen(false)} className={dropItemCls}><Package size={18} /> My Orders</Link>
                    <Link to="/wishlist" onClick={() => setDropOpen(false)} className={dropItemCls}><Heart size={18} /> Wishlist</Link>
                    <Link to="/profile" onClick={() => setDropOpen(false)} className={dropItemCls}><UserCircle size={18} /> Profile</Link>
                    <div className="border-t my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-white text-red-600 font-semibold text-[11px] px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3">
          <Link to="/cart" className="relative text-white">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <CartBadge small />
          </Link>
          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-white/20 px-5 py-5 flex flex-col gap-4">
          {NAV_ITEMS.map(({ label, path }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)} className={mobileNavCls(path)}>{label}</Link>
          ))}
          <Link to="/shop" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700 hover:text-red-600">Shop</Link>

          <div className="border-t pt-4 flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700">Admin Panel</Link>}
                <Link to="/orders" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700">My Orders</Link>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700">Wishlist</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700">Profile</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-sm tracking-widest uppercase text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase text-gray-700">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}