import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10' },
  { path: '/admin/categories', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { path: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { path: '/admin/users', label: 'Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 4a4 4 0 10-8 0' },
  { path: '/admin/payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 h-screen w-56 bg-blue-950 text-cream flex flex-col z-40 transition-transform md:transition-none flex-shrink-0`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col leading-none">
            <span className="font-normal text-lg tracking-widest uppercase font-bold">SIVORA</span>
            <span className="text-[9px] font-sans tracking-[0.3em] text-stone uppercase">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 font-sans text-xs tracking-widest uppercase transition-colors ${location.pathname === item.path ? 'bg-white/10 text-cream' : 'text-stone hover:text-cream hover:bg-white/5'}`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d={item.icon}/></svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-serif text-sm">{user?.name?.[0] || 'A'}</div>
            <div>
              <p className="font-sans text-xs text-cream">{user?.name}</p>
              <p className="font-sans text-[10px] text-stone">Administrator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 text-center border border-white/20 text-stone font-sans text-[9px] tracking-widest uppercase py-1.5 hover:text-cream hover:border-white/40 transition-colors">Store</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="flex-1 border border-white/20 text-stone font-sans text-[9px] tracking-widest uppercase py-1.5 hover:text-red-400 hover:border-red-400/40 transition-colors">Logout</button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 md:hidden sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="font-normal text-lg">Admin Panel</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
