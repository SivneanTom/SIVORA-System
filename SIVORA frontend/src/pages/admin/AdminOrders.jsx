import { useState, useEffect } from "react";
import { orderAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { PageLoader } from "../../components/Spinner";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    orderAPI
      .getAll()
      .then((res) => setOrders(res.data?.data || res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, { status });
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
      toast(`Order #${id} marked as ${status}`);
    } catch {
      toast("Failed to update order status", "error");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm(`Cancel order #${id}?`)) return;
    await handleStatusChange(id, "cancelled");
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-normal text-2xl text-charcoal mb-6">Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`font-sans text-[10px] tracking-widest uppercase px-4 py-2 whitespace-nowrap transition-colors ${filter === s ? "bg-charcoal text-cream" : "bg-white border border-gray-200 text-stone hover:border-charcoal"}`}
          >
            {s}{" "}
            {s !== "all" && `(${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {[
                "Order ID",
                "Customer",
                "Date",
                "Total",
                "Status",
                "Actions",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left font-sans text-[10px] tracking-widest uppercase text-stone px-4 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <>
                <tr
                  key={order.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-charcoal">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-stone">
                    {order.user?.name ||
                      order.user?.email ||
                      `User #${order.user_id}`}
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-stone whitespace-nowrap">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-charcoal">
                    ${parseFloat(order.total_price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1.5 border-0 outline-none cursor-pointer ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={order.status === "cancelled"}
                      className="font-sans text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-70 border transition-colors disabled:opacity-30"
                    >
                      Cancel
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setSelected(selected === order.id ? null : order.id)
                      }
                      className="font-sans text-xs text-blue-600 hover:text-blue-800"
                    >
                      {selected === order.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {selected === order.id && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50 px-4 py-4">
                      <p className="font-sans text-[10px] tracking-widest uppercase text-stone mb-2">
                        Order Items
                      </p>
                      {(order.order_items || order.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between py-1.5 border-b border-gray-100 last:border-0"
                        >
                          <span className="font-sans text-xs text-charcoal">
                            {item.product?.name || item.product_name} ×{" "}
                            {item.quantity}
                          </span>
                          <span className="font-sans text-xs text-charcoal">
                            $
                            {parseFloat(
                              (item.price || 0) * item.quantity,
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {!order.order_items && !order.items && (
                        <p className="font-sans text-xs text-stone">
                          No item details available
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center font-sans text-sm text-stone"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
