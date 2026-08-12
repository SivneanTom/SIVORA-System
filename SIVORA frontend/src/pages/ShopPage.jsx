import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  productAPI,
  categoryAPI,
  wishlistAPI,
} from "../api";

import ProductCard from "../components/ProductCard";
import { PageLoader } from "../components/Spinner";

export default function ShopPage() {
  const [products, setProducts] =
    useState([]);

  const [wishlist, setWishlist] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sp] = useSearchParams();

  const [search, setSearch] = useState(
    sp.get("q") || "",
  );

  const [catId, setCatId] = useState(
    sp.get("category_id") || "",
  );

  const [sort, setSort] =
    useState("newest");

  const [maxPrice, setMaxPrice] =
    useState(500);

  const [sideOpen, setSideOpen] =
    useState(false);

  // Load categories and wishlist
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoryResponse =
          await categoryAPI.getAll();

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
              "Wishlist loading error:",
              error,
            );

            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error(
          "Initial shop loading error:",
          error,
        );
      }
    };

    loadInitialData();
  }, []);

  // Sync URL query params
  useEffect(() => {
    setCatId(
      sp.get("category_id") || "",
    );

    setSearch(sp.get("q") || "");
  }, [sp]);

  const fetchProducts = useCallback(
    async () => {
      setLoading(true);

      try {
        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (catId) {
          params.category_id = catId;
        }

        const response =
          await productAPI.getAll(params);

        const rawProducts =
          response.data?.data ||
          response.data ||
          [];

        // Remove duplicate products
        let data = Array.from(
          new Map(
            rawProducts.map((product) => [
              String(product.id),
              product,
            ]),
          ).values(),
        );

        // Price filter
        data = data.filter(
          (product) =>
            parseFloat(product.price) <=
            maxPrice,
        );

        // Sorting
        if (sort === "price_asc") {
          data = [...data].sort(
            (a, b) =>
              parseFloat(a.price) -
              parseFloat(b.price),
          );
        }

        if (sort === "price_desc") {
          data = [...data].sort(
            (a, b) =>
              parseFloat(b.price) -
              parseFloat(a.price),
          );
        }

        if (sort === "newest") {
          data = [...data].sort(
            (a, b) =>
              new Date(b.created_at) -
              new Date(a.created_at),
          );
        }

        setProducts(data);
      } catch (error) {
        console.error(
          "Products loading error:",
          error,
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [search, catId, sort, maxPrice],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone mb-1">
            Discover
          </p>

          <h1 className="font-semibold text-3xl text-charcoal">
            All Products
          </h1>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside
          className={`${
            sideOpen ? "block" : "hidden"
          } md:block w-52 flex-shrink-0`}
        >
          <div className="sticky top-24 space-y-7">
            {/* Search */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-charcoal mb-3">
                Search
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchProducts();
                }}
                className="flex border border-sand"
              >
                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search…"
                  className="flex-1 px-3 py-2 font-sans text-xs outline-none bg-white text-charcoal min-w-0"
                />

                <button
                  type="submit"
                  className="px-3 bg-charcoal text-cream"
                >
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Categories */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-charcoal mb-3">
                Categories
              </p>

              <button
                onClick={() => setCatId("")}
                className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${
                  !catId
                    ? "text-charcoal font-semibold"
                    : "text-stone hover:text-charcoal"
                }`}
              >
                All Categories
              </button>

              {categories.map(
                (category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      setCatId(
                        String(category.id),
                      )
                    }
                    className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${
                      catId ===
                      String(category.id)
                        ? "text-charcoal font-semibold"
                        : "text-stone hover:text-charcoal"
                    }`}
                  >
                    {category.name}
                  </button>
                ),
              )}
            </div>

            {/* Price */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-charcoal mb-3">
                Max Price
              </p>

              <p className="font-sans text-xs text-stone mb-2">
                Up to ${maxPrice}
              </p>

              <input
                type="range"
                min={0}
                max={1000}
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    Number(e.target.value),
                  )
                }
                className="w-full accent-charcoal"
              />
            </div>

            {/* Sort */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-charcoal mb-3">
                Sort By
              </p>

              {[
                [
                  "newest",
                  "Newest First",
                ],
                [
                  "price_asc",
                  "Price: Low–High",
                ],
                [
                  "price_desc",
                  "Price: High–Low",
                ],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setSort(value)
                  }
                  className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${
                    sort === value
                      ? "text-charcoal font-semibold"
                      : "text-stone hover:text-charcoal"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(search || catId) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCatId("");
                }}
                className="font-sans text-[11px] tracking-widest uppercase text-red-600 hover:text-red-800 transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() =>
                setSideOpen(
                  (current) => !current,
                )
              }
              className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase border border-sand px-3 py-2 text-charcoal hover:border-charcoal transition-colors"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                />

                <line
                  x1="8"
                  y1="12"
                  x2="21"
                  y2="12"
                />

                <line
                  x1="13"
                  y1="18"
                  x2="21"
                  y2="18"
                />
              </svg>

              Filters
            </button>
          </div>

          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-3xl text-stone mb-4">
                No products found
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCatId("");
                }}
                className="font-sans text-xs tracking-widest uppercase border border-charcoal px-5 py-2.5 hover:bg-charcoal hover:text-cream transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}