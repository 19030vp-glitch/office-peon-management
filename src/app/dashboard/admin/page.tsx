'use client';

import { useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    createdAt: string;
}

interface Item {
    _id: string;
    name: string;
    price?: number;
    available: boolean;
}

interface Order {
    _id: string;
    employeeName: string;
    department: string;
    status: string;
    items: { itemName: string; quantity: number }[];
    orderedAt: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'menu' | 'orders'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // New user form
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('employee');
    const [newUserDept, setNewUserDept] = useState('');
    const [userLoading, setUserLoading] = useState(false);
    const [userError, setUserError] = useState('');
    const [userSuccess, setUserSuccess] = useState('');

    // New item form
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [itemLoading, setItemLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchItems();
        fetchOrders();
    }, []);

    // --- Fetch Functions ---
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/items');
            if (res.ok) setItems(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) setOrders(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    // --- Actions ---
    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserError('');
        setUserSuccess('');
        setUserLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole,
                    department: newUserDept,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create user');

            setUserSuccess(`User "${data.name}" (${data.role}) created successfully!`);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('employee');
            setNewUserDept('');
            fetchUsers();
        } catch (err: any) {
            setUserError(err.message);
        } finally {
            setUserLoading(false);
        }
    };

    const deleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const addItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName) return;
        setItemLoading(true);

        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItemName,
                    price: newItemPrice ? Number(newItemPrice) : undefined,
                }),
            });

            if (res.ok) {
                setNewItemName('');
                setNewItemPrice('');
                fetchItems();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add item');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setItemLoading(false);
        }
    };

    const toggleItemAvailability = async (item: Item) => {
        try {
            const res = await fetch('/api/items', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item._id, available: !item.available }),
            });

            if (res.ok) {
                fetchItems();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update item');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteItem = async (itemId: string, itemName: string) => {
        if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

        try {
            const res = await fetch('/api/items', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId }),
            });

            if (res.ok) {
                fetchItems();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete item');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'peon':
                return 'bg-purple-100 text-purple-800';
            case 'employee':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { key: 'users' as const, label: '👥 Users', count: users.length },
        { key: 'menu' as const, label: '📋 Menu', count: items.length },
        { key: 'orders' as const, label: '📦 Orders', count: orders.length },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Admin Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5 mb-10 inline-flex border border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${activeTab === tab.key
                            ? 'bg-white text-blue-600 shadow-xl shadow-blue-50 border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-3 px-2.5 py-0.5 text-xs rounded-full font-bold ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ===== USERS TAB ===== */}
            {activeTab === 'users' && (
                <div className="space-y-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 relative">Create New Account</h2>

                        {userError && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-2xl mb-6 text-sm flex items-center">
                                <span className="mr-3 text-xl">⚠️</span>
                                {userError}
                            </div>
                        )}
                        {userSuccess && (
                            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-2xl mb-6 text-sm flex items-center">
                                <span className="mr-3 text-xl">✅</span>
                                {userSuccess}
                            </div>
                        )}

                        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="name@office.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                                <input
                                    type="text"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="Min. 6 chars"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Job Role</label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.25rem_center] bg-no-repeat"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="peon">Peon</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                <input
                                    type="text"
                                    value={newUserDept}
                                    onChange={(e) => setNewUserDept(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="e.g. Sales, HR..."
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={userLoading}
                                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center ${userLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {userLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                            <div className="text-sm font-medium text-gray-400">{users.length} Total Users</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dept.</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Added</th>
                                        <th className="px-8 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{u.name}</p>
                                                        <p className="text-xs text-gray-400 tracking-tight">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-gray-600">{u.department || '—'}</td>
                                            <td className="px-8 py-5 text-sm text-gray-400 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => deleteUser(u._id, u.name)}
                                                    className="opacity-0 group-hover:opacity-100 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-20 px-4 text-gray-400 font-medium">No system users found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MENU TAB ===== */}
            {activeTab === 'menu' && (
                <div className="space-y-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 relative">Add Menu Item</h2>
                        <form onSubmit={addItem} className="flex flex-col md:flex-row gap-6 relative">
                            <div className="flex-1 space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Item Title</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="e.g. Masala Tea"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-40 space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price ₹</label>
                                <input
                                    type="number"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none text-gray-900 placeholder-gray-300"
                                    placeholder="0 for free"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={itemLoading}
                                    className={`w-full md:w-auto px-10 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-100 hover:shadow-green-200 transform transition-all active:scale-95 ${itemLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {itemLoading ? 'Adding...' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item._id} className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-gray-100 border border-white/50 p-6 flex flex-col justify-between group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                                        {item.name.toLowerCase().includes('tea') ? '🍵' :
                                            item.name.toLowerCase().includes('coffee') ? '☕' :
                                                item.name.toLowerCase().includes('water') ? '💧' : '🍰'}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => toggleItemAvailability(item)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${item.available ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100' : 'bg-red-100 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-600 hover:border-green-100'}`}
                                        >
                                            {item.available ? 'Available' : 'Out of Stock'}
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item._id, item.name)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                    <p className="text-2xl font-black text-gray-900 mt-2">
                                        {item.price ? `₹${item.price}` : <span className="text-green-600">Free</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4 grayscale opacity-10">🍜</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Your menu is empty</h3>
                                <p className="text-sm text-gray-400">Add some items for the employees to enjoy.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Order Monitoring</h2>
                        <div className="text-sm font-medium text-gray-400">{orders.length} Handled Today</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                                    <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Requested Items</th>
                                    <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Progress</th>
                                    <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900">{order.employeeName}</p>
                                            <p className="text-xs text-gray-400 tracking-tight">{order.department}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                {order.items.map((i, idx) => (
                                                    <span key={idx} className="block text-sm font-bold text-gray-700">
                                                        <span className="text-blue-600 font-mono inline-block w-4">{i.quantity}</span>
                                                        <span className="text-gray-400 mx-1">×</span>
                                                        {i.itemName}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-400 font-medium">
                                            {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="text-center py-24 px-4 text-gray-400 font-medium">No orders detected in the system yet.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
