import { useState, useEffect } from 'react';
import { adminAPI, orderAPI } from '../../api';
import { PageLoader } from '../../components/Spinner';
import { Link } from 'react-router-dom';

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  Promise.all([
    adminAPI.dashboard().catch(() => null),
    orderAPI.getAll().catch(() => ({ data: [] })),
  ])
    .then(([dashRes, ordersRes]) => {

      const dashData = dashRes?.data?.data || dashRes?.data || {};

      const orders =
        ordersRes?.data?.data ||
        ordersRes?.data ||
        [];

      console.log("Orders:", orders);

      const revenue = orders.reduce(
        (total, order) => {
          return total + Number(order.total_price || 0);
        },
        0
      );

      setRecentOrders(orders.slice(0, 5));

      setStats({
        total_users: dashData.total_users ?? 0,
        total_products: dashData.total_products ?? 0,
        total_orders: orders.length,
        total_revenue: revenue,
      });

    })
    .finally(() => setLoading(false));

}, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Total Revenue', value: typeof stats?.total_revenue === 'number' ? `$${stats.total_revenue.toFixed(2)}` : stats?.total_revenue, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.total_orders, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-blue-500' },
    { label: 'Total Products', value: stats?.total_products, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', color: 'bg-purple-500' },
    { label: 'Total Users', value: stats?.total_users, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-semibold text-3xl text-charcoal">Dashboard</h1>
        <p className="font-sans text-sm text-stone mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-5 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} w-10 h-10 rounded flex items-center justify-center`}>
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><path d={card.icon}/></svg>
              </div>
            </div>
            <p className="font-sans text-2xl font-bold text-charcoal">{card.value}</p>
            <p className="font-sans text-xs text-stone mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans text-sm font-semibold tracking-widest uppercase text-charcoal">Recent Orders</h2>
          <Link to="/admin/orders" className="font-sans text-xs text-blue-600 hover:text-blue-800">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order ID','Date','Total','Status',''].map((h) => (
                  <th key={h} className="text-left font-sans text-[10px] tracking-widest uppercase text-stone pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-sans text-sm font-semibold text-charcoal">#{order.id}</td>
                  <td className="py-3 pr-4 font-sans text-xs text-stone">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-charcoal">${Number(order.total_price || 0).toFixed(2)}</td>
                  <td className="py-3 pr-4"><span className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status || 'pending'}</span></td>
                  <td className="py-3"><Link to="/admin/orders" className="font-sans text-xs text-blue-600 hover:text-blue-800">View</Link></td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center font-sans text-sm text-stone">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
