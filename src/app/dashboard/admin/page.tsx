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
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Panel</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ===== USERS TAB ===== */}
            {activeTab === 'users' && (
                <div className="space-y-8">
                    {/* Create User Form */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New User</h2>

                        {userError && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                {userError}
                            </div>
                        )}
                        {userSuccess && (
                            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                                {userSuccess}
                            </div>
                        )}

                        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                    placeholder="john@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="text"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                    placeholder="Set a password"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="peon">Peon</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={newUserDept}
                                        onChange={(e) => setNewUserDept(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                        placeholder="e.g. HR"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={userLoading}
                                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 ${userLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {userLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u.department || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteUser(u._id, u.name)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-10 text-gray-400">No users found</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MENU TAB ===== */}
            {activeTab === 'menu' && (
                <div className="space-y-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Add Menu Item</h2>
                        <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                placeholder="Item name (e.g. Masala Tea)"
                                required
                            />
                            <input
                                type="number"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                className="w-full sm:w-32 px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                placeholder="Price ₹"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all"
                            >
                                Add
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <div key={item._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-5 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.price ? `₹${item.price}` : 'Free'}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.available ? 'Available' : 'Sold Out'}
                                </span>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-400">No menu items yet. Add one above!</div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">All Orders ({orders.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{order.employeeName}</p>
                                            <p className="text-xs text-gray-500">{order.department}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {order.items.map((i, idx) => (
                                                <span key={idx} className="block">{i.quantity}x {i.itemName}</span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="text-center py-10 text-gray-400">No orders yet</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
