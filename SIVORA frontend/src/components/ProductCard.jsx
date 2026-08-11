// import { useState } from "react";
// import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { wishlistAPI } from "../api";
import { useToast } from "../context/ToastContext";

const PH =
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80";

function Stars({ r = 4 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={n <= Math.round(r) ? "#2C2018" : "none"}
          stroke="#2C2018"
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export { Stars };

export default function ProductCard({ product, wishlist = [] }) {
  const wished = wishlist.some(
  item =>
    item.product_id === product.id ||
    item.product?.id === product.id
);
  const [adding, setAdding] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

const getImage = () => {
  // Case 1: product has direct image
  if (product?.image) {
    return product.image.startsWith("http")
      ? product.image
      : `${import.meta.env.VITE_STORAGE_URL}/${product.image}`;
  }

  // Case 2: product has images array
  if (product?.images && product.images.length > 0) {
    const image = product.images[0]?.image;

    if (image) {
      return image.startsWith("http")
        ? image
        : `${import.meta.env.VITE_STORAGE_URL}/${image}`;
    }
  }

  // Case 3: fallback
  return PH;
};

const img = getImage();

  const handleCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast("Please login first", "error");
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast(`${product.name} added to cart`);
    } catch {
      toast("Could not add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleWish = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      if (wished) {
        const res = await wishlistAPI.get();
        const wishlist = res.data?.data || res.data || [];

        const item = wishlist.find(
          (w) => w.product_id === product.id || w.product?.id === product.id,
        );

        if (item) {
          await wishlistAPI.remove(item.id);
        }

        // setWished(false);
        window.location.reload();
      } else {
        await wishlistAPI.add({
          product_id: product.id,
        });

        // setWished(true);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-sand aspect-[3/4] mb-3">
        <img
  key={img}
  src={img}
  alt={product?.name || "Product"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = PH;
          }}
        />
        <button
          onClick={handleWish}
          className="absolute top-2.5 right-2.5 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-110 transition-transform z-10"
        >
          <svg
            width="13"
            height="13"
            fill={wished ? "#2C2018" : "none"}
            stroke="#2C2018"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {product?.stock === 0 && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-sans text-[9px] tracking-widest uppercase px-2 py-0.5">
            Out of Stock
          </div>
        )}
        <button
          onClick={handleCart}
          disabled={adding || product?.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-charcoal text-cream font-sans text-[10px] tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50"
        >
          {adding
            ? "Adding…"
            : product?.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
        </button>
      </div>
      <p className="font-sans text-xs text-charcoal truncate mb-0.5">
        {product?.name}
      </p>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {product?.discount_price ? (
          <>
            <span className="font-sans text-sm font-bold text-red-600">
              ${parseFloat(product.discount_price).toFixed(2)}
            </span>

            <span className="font-sans text-xs text-gray-400 line-through">
              ${parseFloat(product.price).toFixed(2)}
            </span>

            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded">
              -
              {Math.round(
                ((product.price - product.discount_price) / product.price) *
                  100,
              )}
              %
            </span>
          </>
        ) : (
          <span className="font-sans text-sm font-semibold text-charcoal">
            ${parseFloat(product?.price || 0).toFixed(2)}
          </span>
        )}
      </div>{" "}
      <Stars r={product?.rating || 4} />
    </Link>
  );
}
