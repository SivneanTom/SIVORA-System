import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI, categoryAPI, wishlistAPI } from "../api";
import ProductCard from "../components/ProductCard";
import { PageLoader } from "../components/Spinner";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get("q") || "");
  const [catId, setCatId] = useState(sp.get("category_id") || "");
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(500);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    Promise.all([categoryAPI.getAll(), wishlistAPI.get()])
      .then(([cr, wr]) => {
        setCategories(cr.data?.data || cr.data || []);
        setWishlist(wr.data?.data || wr.data || []);
      })
      .catch(console.error);
  }, []);
  // Sync state when URL params change (e.g. clicking header dropdown)
  useEffect(() => {
    setCatId(sp.get("category_id") || "");
    setSearch(sp.get("q") || "");
  }, [sp]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (catId) params.category_id = catId;
    productAPI
      .getAll(params)
      .then((r) => {
        let data = r.data?.data || r.data || [];
        if (sort === "price_asc")
          data = [...data].sort((a, b) => a.price - b.price);
        if (sort === "price_desc")
          data = [...data].sort((a, b) => b.price - a.price);
        if (sort === "newest") data = [...data].reverse();
        data = data.filter((p) => parseFloat(p.price) <= maxPrice);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, [search, catId, sort, maxPrice]);

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
          <h1 className="font-semibold text-3xl text-charcoal">All Products</h1>
        </div>
        {/* <p className="font-sans text-xs text-stone hidden sm:block">{products.length} results</p> */}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside
          className={`${sideOpen ? "block" : "hidden"} md:block w-52 flex-shrink-0`}
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 px-3 py-2 font-sans text-xs outline-none bg-white text-charcoal min-w-0"
                />
                <button type="submit" className="px-3 bg-charcoal text-cream">
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" />
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
                className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${!catId ? "text-charcoal font-semibold" : "text-stone hover:text-charcoal"}`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatId(String(c.id))}
                  className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${catId === String(c.id) ? "text-charcoal font-semibold" : "text-stone hover:text-charcoal"}`}
                >
                  {c.name}
                </button>
              ))}
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
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="w-full accent-charcoal"
              />
            </div>

            {/* Sort */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-charcoal mb-3">
                Sort By
              </p>
              {[
                ["newest", "Newest First"],
                ["price_asc", "Price: Low–High"],
                ["price_desc", "Price: High–Low"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setSort(v)}
                  className={`block w-full text-left font-sans text-xs py-1.5 transition-colors ${sort === v ? "text-charcoal font-semibold" : "text-stone hover:text-charcoal"}`}
                >
                  {l}
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

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 md:hidden">
            {/* <p className="font-sans text-xs text-stone">{products.length} results</p> */}
            <button
              onClick={() => setSideOpen(!sideOpen)}
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
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="13" y1="18" x2="21" y2="18" />
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
              {products.map((p) => (
                <ProductCard key={p.id} product={p} wishlist={wishlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
