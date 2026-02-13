'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
    itemId: string;
    itemName: string;
    quantity: number;
}

interface Order {
    _id: string;
    employeeName: string;
    department: string;
    status: string;
    items: OrderItem[];
    orderedAt: string;
    note?: string;
}

export default function PeonDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders'); // API defaults to active orders for peons
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSummary = () => {
        const today = new Date().toDateString();
        // The API returns active orders, but for summary we might want to know total items
        let totalActive = orders.length;
        let totalTea = 0;
        let totalCoffee = 0;
        orders.forEach(o => {
            o.items.forEach(i => {
                if (i.itemName.toLowerCase().includes('tea')) totalTea += i.quantity;
                if (i.itemName.toLowerCase().includes('coffee')) totalCoffee += i.quantity;
            });
        });
        return { totalActive, totalTea, totalCoffee };
    };

    const summary = getSummary();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Peon Dashboard</h1>

            {/* Vibrant Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-blue-100 border border-white/50 p-6 overflow-hidden relative group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60 group-hover:bg-blue-100 transition-colors"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold mb-4">📦</div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Orders</h3>
                        <p className="text-4xl font-black text-gray-900 mt-1">{summary.totalActive}</p>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-green-100 border border-white/50 p-6 overflow-hidden relative group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60 group-hover:bg-green-100 transition-colors"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 font-bold mb-4">🍵</div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Tea</h3>
                        <p className="text-4xl font-black text-gray-900 mt-1">{summary.totalTea}</p>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-yellow-100 border border-white/50 p-6 overflow-hidden relative group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-yellow-50 rounded-full blur-2xl opacity-60 group-hover:bg-yellow-100 transition-colors"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 font-bold mb-4">☕</div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Coffee</h3>
                        <p className="text-4xl font-black text-gray-900 mt-1">{summary.totalCoffee}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8">Incoming Requests</h2>

            {loading && orders.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className={`bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 transition-all duration-500 overflow-hidden flex flex-col ${order.status === 'pending' ? 'border-yellow-400 animate-pulse-shadow scale-[1.01]' : 'border-white/50 shadow-gray-200/50'}`}
                        >
                            <div className="p-6 pb-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-gray-900 text-xl leading-tight">{order.employeeName}</h3>
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mt-0.5">{order.department}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="p-6 flex-grow">
                                <ul className="space-y-3 mb-6">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center group">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                    {item.itemName.toLowerCase().includes('tea') ? '🍵' :
                                                        item.itemName.toLowerCase().includes('coffee') ? '☕' :
                                                            item.itemName.toLowerCase().includes('water') ? '💧' : '🍰'}
                                                </div>
                                                <span className="font-bold text-gray-800 text-lg">{item.itemName}</span>
                                            </div>
                                            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 font-black text-lg">×{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>

                                {order.note && (
                                    <div className="bg-orange-50/50 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 text-sm text-orange-900 mb-6 flex items-start space-x-2">
                                        <span className="text-lg">💡</span>
                                        <p className="font-medium italic leading-relaxed">"{order.note}"</p>
                                    </div>
                                )}

                                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-widest flex items-center mb-6">
                                    <span className="mr-2">⏰</span>
                                    Ordered at {new Date(order.orderedAt).toLocaleTimeString()}
                                </div>

                                <div className="space-y-3">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(order._id, 'accepted')}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95"
                                        >
                                            Accept Request
                                        </button>
                                    )}
                                    {order.status === 'accepted' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => updateStatus(order._id, 'in-progress')}
                                                className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                Start Preparing
                                            </button>
                                            <button
                                                onClick={() => updateStatus(order._id, 'delivered')}
                                                className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                Done & Ready
                                            </button>
                                        </div>
                                    )}
                                    {order.status === 'in-progress' && (
                                        <button
                                            onClick={() => updateStatus(order._id, 'delivered')}
                                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-200 transition-all active:scale-95"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-gray-100/30 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-gray-200/50">
                            <div className="text-6xl mb-6 opacity-20 grayscale">☕</div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No active requests</h3>
                            <p className="text-gray-400 font-medium">Take a break! New requests will appear here instantly.</p>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse-shadow {
                    0%, 100% { box-shadow: 0 25px 50px -12px rgba(250, 204, 21, 0.4); transform: scale(1.01); }
                    50% { box-shadow: 0 25px 50px -12px rgba(250, 204, 21, 0.2); transform: scale(1); }
                }
                .animate-pulse-shadow {
                    animation: pulse-shadow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
