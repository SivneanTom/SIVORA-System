import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../api";
import { PageLoader } from "../components/Spinner";

const SC = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const PH = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    orderAPI
      .getMine()
      .catch(() => orderAPI.getAll())
      .then((r) => setOrders(r.data?.data || r.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-semibold text-2xl text-charcoal mb-10">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-stone mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            viewBox="0 0 24 24"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-serif text-2xl text-stone mb-4">No orders yet</p>
          <Link
            to="/shop"
            className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-sand overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpanded(expanded === order.id ? null : order.id)
                }
                className="w-full flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-cream transition-colors text-left"
              >
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-stone">
                      Order
                    </p>
                    <p className="font-sans text-sm font-bold text-charcoal">
                      #{order.id}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-stone">
                      Date
                    </p>
                    <p className="font-sans text-sm text-charcoal">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-stone">
                      Items
                    </p>
                    <p className="font-sans text-sm text-charcoal">
                      {(order.order_items || order.items || []).length}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-stone">
                      Total
                    </p>
                    <p className="font-sans text-sm font-bold text-charcoal">
                      ${parseFloat(order.total_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`font-sans text-[10px] tracking-widest uppercase px-3 py-1 ${SC[order.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {order.status || "pending"}
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className={`transition-transform flex-shrink-0 ${expanded === order.id ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {expanded === order.id && (
                <div className="border-t border-sand px-5 py-5">
                  {(order.order_items || order.items || []).map((item) => {
                    const p = item.product || {};
                    const imgUrl = p?.image
                      ? p.image.startsWith("http")
                        ? p.image
                        : `http://127.0.0.1:8000/storage/${p.image}`
                      : PH;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 py-3 border-b border-sand last:border-0"
                      >
                        <div className="w-12 h-14 bg-sand flex-shrink-0 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={p?.name || item.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = PH;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-sans text-sm font-semibold text-charcoal">
                            {p?.name || item.product_name}
                          </p>
                          <p className="font-sans text-xs text-stone">
                            Qty: {item.quantity} × $
                            {parseFloat(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-sans text-sm font-semibold text-charcoal">
                          ${(item.quantity * (item.price || 0)).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="font-sans text-sm font-bold text-charcoal">
                      Total: ${parseFloat(order.total_price || 0).toFixed(2)}
                    </div>
                    {order.address && (
                      <p className="font-sans text-xs text-stone">
                        Delivery: {order.address?.address},{" "}
                        {order.address?.city}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
