import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productAPI } from "../api";
import { wishlistAPI } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageLoader } from "../components/Spinner";
import ProductCard from "../components/ProductCard";
import { Stars } from "../components/ProductCard";

const PH =
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("description");
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    productAPI
      .getOne(id)
      .then((r) => setProduct(r.data?.data || r.data))
      .finally(() => setLoading(false));
    productAPI
      .getAll()
      .then((r) =>
        setRelated(
          (r.data?.data || r.data || [])
            .filter((p) => p.id !== +id)
            .slice(0, 4),
        ),
      );
  }, [id]);

    const img = product?.image
    ? product.image.startsWith("http")
      ? product.image
      : `${import.meta.env.VITE_STORAGE_URL}/${product.image}`
    : PH;

  const handleCart = async () => {
    // if (!isLoggedIn) {
    //   toast("Please login first", "error");
    //   return;
    // }
    if (!isLoggedIn) {
      toast("Please login first", "error");

      navigate("/login", {
        state: {
          // from:`/product/${product.id}`
          from: `/products/${product.id}`,
        },
      });

      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      toast(`${product.name} added to cart`);
    } catch {
      toast("Could not add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleWish = async () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });
      return;
    }

    try {
      if (!wished) {
        await wishlistAPI.add({ product_id: product.id });
      }

      setWished(!wished);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <PageLoader />;
  if (!product)
    return (
      <div className="text-center py-20 font-serif text-2xl text-stone">
        Product not found
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <nav className="mb-8 flex items-center gap-2 font-sans text-xs text-stone">
        <Link to="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-charcoal transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-charcoal truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-[380px] aspect-[4/5] bg-sand overflow-hidden">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = PH;
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              to={`/shop?category_id=${product.category_id}`}
              className="font-normal text-[11px] tracking-[0.3em] uppercase text-stone mb-3 hover:text-charcoal transition-colors"
            >
              {product.category?.name}
            </Link>
          )}
          <h3 className="font-normal text-2xl md:text-5xl text-charcoal mb-5">
            {product.name}
          </h3>
          <div className="flex items-center gap-3 mb-5">
            <Stars r={product?.rating || 4} />
            <span className="font-sans text-xs text-stone">(124 reviews)</span>
          </div>
          <p className="font-serif text-3xl text-charcoal mb-6">
            ${parseFloat(product.price).toFixed(2)}
          </p>

          <div className="mb-5">
            {product.stock > 0 ? (
              <span className="font-sans text-xs bg-green-50 text-green-700 px-3 py-1 border border-green-200">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="font-sans text-xs bg-red-50 text-red-600 px-3 py-1 border border-red-200">
                Out of Stock
              </span>
            )}
          </div>

          <p className="font-sans text-sm text-stone leading-relaxed mb-8 max-w-md">
            {product.description ||
              "A beautifully crafted piece from our latest collection, designed for comfort and everyday elegance."}
          </p>

          {/* Qty */}
          <div className="flex items-center gap-5 mb-6">
            <span className="font-sans text-[11px] tracking-widest uppercase text-charcoal">
              Qty
            </span>
            <div className="flex items-center border border-sand">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-sand transition-colors text-lg"
              >
                −
              </button>
              <span className="w-10 text-center font-sans text-sm text-charcoal">
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-sand transition-colors text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={handleCart}
              disabled={adding || product.stock === 0}
              className="flex-1 bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase py-4 hover:bg-espresso transition-colors disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
            <button
              onClick={handleWish}
              className="w-14 h-14 border border-sand flex items-center justify-center hover:border-charcoal transition-colors"
            >
              <svg
                width="18"
                height="18"
                fill={wished ? "#2C2018" : "none"}
                stroke="#2C2018"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <div className="border-t border-sand pt-5 space-y-2.5">
            {[
              ["SKU", `LUN-${String(product.id).padStart(4, "0")}`],
              ["Category", product.category?.name || "Fashion"],
              ["Status", product.stock > 0 ? "In Stock" : "Out of Stock"],
            ].map(([l, v]) => (
              <div key={l} className="flex gap-4">
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone w-20">
                  {l}
                </span>
                <span className="font-sans text-xs text-charcoal">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex border-b border-sand mb-6">
          {["description", "details", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-sans text-[11px] tracking-widest uppercase px-6 py-3 border-b-2 transition-colors ${tab === t ? "border-charcoal text-charcoal" : "border-transparent text-stone hover:text-charcoal"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "description" && (
          <p className="font-sans text-sm text-stone leading-relaxed max-w-2xl">
            {product.description ||
              "This piece embodies the essence of modern elegance. Crafted with attention to detail, it offers both style and comfort for everyday wear. A versatile addition to any wardrobe."}
          </p>
        )}
        {tab === "details" && (
          <div className="max-w-sm space-y-2">
            {[
              ["Material", "Premium Cotton Blend"],
              ["Fit", "Regular Fit"],
              ["Care", "Machine Wash 30°C"],
              ["Made In", "Italy"],
            ].map(([l, v]) => (
              <div
                key={l}
                className="flex justify-between border-b border-sand pb-2"
              >
                <span className="font-sans text-xs text-stone">{l}</span>
                <span className="font-sans text-xs text-charcoal">{v}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "reviews" && (
          <div className="space-y-4 max-w-2xl">
            {[
              { n: "Sarah M.", t: "Love this piece!", r: 5 },
              { n: "Emma L.", t: "Great quality and fast shipping.", r: 4 },
              { n: "Julia R.", t: "Perfect for daily wear.", r: 5 },
            ].map((rv) => (
              <div key={rv.n} className="border border-sand p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-sand rounded-full flex items-center justify-center font-serif text-sm">
                    {rv.n[0]}
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-charcoal">
                      {rv.n}
                    </p>
                    <Stars r={rv.r} />
                  </div>
                </div>
                <p className="font-sans text-xs text-stone">{rv.t}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-normal text-2xl text-charcoal mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
