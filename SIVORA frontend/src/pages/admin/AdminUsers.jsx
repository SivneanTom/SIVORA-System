import { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/Spinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    userAPI.getAll().then((res) => setUsers(res.data?.data || res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleToggleBlock = async (user) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await userAPI.update(user.id, { status: newStatus });
      setUsers(users.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
      toast(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
    } catch { toast('Failed to update user status', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await userAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
      toast('User deleted');
    } catch { toast('Failed to delete user', 'error'); }
  };

  const filtered = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-normal text-2xl text-charcoal mb-6">Users</h1>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email..." className="border border-gray-200 px-4 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors w-80 bg-white"/>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['User','Email','Role','Status','Joined','Actions'].map((h) => (
                <th key={h} className="text-left font-sans text-[10px] tracking-widest uppercase text-stone px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-cream font-serif text-sm flex-shrink-0">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                  <span className="font-sans text-sm font-semibold text-charcoal">{user.name}</span>
                </td>
                <td className="px-4 py-3 font-sans text-xs text-stone">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>{user.role || 'customer'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.status === 'blocked' ? 'Blocked' : 'Active'}</span>
                </td>
                <td className="px-4 py-3 font-sans text-xs text-stone whitespace-nowrap">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleBlock(user)} className={`font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${user.status === 'blocked' ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'}`}>
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="font-sans text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center font-sans text-sm text-stone">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
