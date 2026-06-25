import { useState, useEffect } from "react";
import { paymentAPI } from "../../api";
import { PageLoader } from "../../components/Spinner";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI
      .getAll()
      .then((res) => setPayments(res.data?.data || res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const totalRevenue = payments
    .filter((p) => (p.status || "paid") === "paid")
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div>
      <h1 className="font-normal text-2xl text-charcoal mb-6">Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-5">
          <p className="font-sans text-2xl font-bold text-charcoal">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="font-sans text-xs text-stone mt-1">Total Received</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <p className="font-sans text-2xl font-bold text-charcoal">
            {payments.length}
          </p>
          <p className="font-sans text-xs text-stone mt-1">
            Total Transactions
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <p className="font-sans text-2xl font-bold text-charcoal">
            {payments.filter((p) => p.status === "pending").length}
          </p>
          <p className="font-sans text-xs text-stone mt-1">Pending Payments</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {[
                "Payment ID",
                "Order",
                "Method",
                "Amount",
                "Status",
                "Date",
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
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-sans text-sm font-semibold text-charcoal">
                  #{p.id}
                </td>
                <td className="px-4 py-3 font-sans text-xs text-stone">
                  #{p.order_id}
                </td>
                <td className="px-4 py-3 font-sans text-xs text-charcoal capitalize">
                  {(p.method || p.payment_method || "N/A").replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 font-sans text-sm font-semibold text-charcoal">
                  ${parseFloat(p.amount || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {p.status || "paid"}
                  </span>
                </td>
                <td className="px-4 py-3 font-sans text-xs text-stone whitespace-nowrap">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center font-sans text-sm text-stone"
                >
                  No payment records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
