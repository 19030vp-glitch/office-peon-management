'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
    itemId: string;
    itemName: string;
    quantity: number;
}

interface Order {
    _id: string;
    status: string;
    items: OrderItem[];
    orderedAt: string;
    note?: string;
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled'>('all');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        return o.status === filter;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
                    <p className="text-gray-500 mt-1">Review all your past and current office orders.</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-xl space-x-1">
                    {(['all', 'delivered', 'cancelled'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="h-24 bg-gray-200 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                                            📦
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                            <p className="font-mono text-sm text-gray-600">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</p>
                                            <p className="text-sm font-medium text-gray-600">
                                                {new Date(order.orderedAt).toLocaleDateString()} at {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Items ordered</p>
                                        <div className="flex flex-wrap gap-2">
                                            {order.items.map((i, idx) => (
                                                <div key={idx} className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-sm font-medium text-gray-700">
                                                    {i.quantity}x {i.itemName}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {order.note && (
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Note</p>
                                            <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100 text-sm text-gray-600 italic">
                                                "{order.note}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4 grayscale opacity-10">📜</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">No orders found</h3>
                            <p className="text-gray-400">Try adjusting your filters or place a new order.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
