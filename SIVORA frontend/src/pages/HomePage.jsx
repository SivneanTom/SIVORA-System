import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  productAPI,
  categoryAPI,
  wishlistAPI,
} from "../api";
import ProductCard from "../components/ProductCard";
import { PageLoader } from "../components/Spinner";

export default function HomePage() {
  const [latestProducts, setLatestProducts] =
    useState([]);
  const [otherProducts, setOtherProducts] =
    useState([]);
  const [categories, setCategories] =
    useState([]);
  const [wishlist, setWishlist] =
    useState([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [productResponse, categoryResponse] =
          await Promise.all([
            productAPI.getAll(),
            categoryAPI.getAll(),
          ]);

        const rawProducts =
          productResponse.data?.data ||
          productResponse.data ||
          [];

        // Remove duplicate products by ID
        const uniqueProducts = Array.from(
          new Map(
            rawProducts.map((product) => [
              String(product.id),
              product,
            ]),
          ).values(),
        );

        // Sort newest first
        const sortedProducts = [
          ...uniqueProducts,
        ].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at),
        );

        setLatestProducts(
          sortedProducts.slice(0, 10),
        );

        setOtherProducts(
          sortedProducts.slice(10),
        );

        setCategories(
          categoryResponse.data?.data ||
            categoryResponse.data ||
            [],
        );

        const token =
          localStorage.getItem("token");

        if (token) {
          try {
            const wishlistResponse =
              await wishlistAPI.get();

            setWishlist(
              wishlistResponse.data?.data ||
                wishlistResponse.data ||
                [],
            );
          } catch (error) {
            console.error(
              "Wishlist unavailable:",
              error,
            );

            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error(
          "Home loading error:",
          error,
        );

        setLatestProducts([]);
        setOtherProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  return (
    <div className="bg-cream">
      {/* Latest Products */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-1">
                Latest Collection
              </p>

              <h2 className="text-3xl text-charcoal">
                New Trends, Just For You
              </h2>
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {latestProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                  />
                ),
              )}
            </div>
          ) : (
            <p className="text-center font-sans text-sm text-stone py-12">
              No products available.
            </p>
          )}
        </div>
      </section>

      {/* Promo banners */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden h-64 bg-white flex items-center">
          <img
            src="https://i.pinimg.com/1200x/23/50/3b/23503b96d869568ed10b5a0c852ef6bf.jpg"
            alt="Sale"
            className="absolute right-0 top-0 h-full w-1/2 object-cover object-center"
          />

          <div className="relative z-10 px-8">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-2">
              Limited Time Offer
            </p>

            <h3 className="font-semibold text-3xl text-charcoal mb-1">
              Spring Sale
            </h3>

            <p className="font-sans text-4xl font-semibold text-charcoal mb-5">
              Up to 50% Off
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-5 py-3 hover:bg-espresso transition-colors"
            >
              Shop The Sale
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden h-64 bg-charcoal flex items-center">
          <img
            src="https://i.pinimg.com/736x/aa/99/e8/aa99e8e16cef90ae51f11a72e6cd70da.jpg"
            alt="New"
            className="absolute right-0 top-0 h-full w-1/2 object-cover object-center opacity-60"
          />

          <div className="relative z-10 px-8">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-2">
              New Arrivals
            </p>

            <h3 className="font-semibold text-3xl text-cream mb-1">
              Fresh Styles
            </h3>

            <p className="font-serif text-4xl font-semibold text-cream mb-5">
              Just Landed
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-cream text-cream font-sans text-[11px] tracking-widest uppercase px-5 py-3 hover:bg-cream hover:text-charcoal transition-colors"
            >
              Explore New In
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Other products */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-1">
                Recommended
              </p>

              <h2 className="text-3xl text-charcoal">
                Our Most Loved Picks
              </h2>
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : otherProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                  />
                ),
              )}
            </div>
          ) : (
            <p className="text-center font-sans text-sm text-stone py-12">
              No more products available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}