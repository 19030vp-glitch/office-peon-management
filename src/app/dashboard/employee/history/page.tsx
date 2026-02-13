'use client';

import { useState, useEffect } from 'react';

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200 shadow-green-100';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 shadow-red-100';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-yellow-100';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200 shadow-blue-100';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200 shadow-purple-100';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 shadow-gray-100';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Order Log</h1>
                    <p className="text-gray-500 mt-2 font-medium">Detailed record of everything you've requested from the kitchen.</p>
                </div>

                <div className="flex p-1.5 bg-gray-100/50 backdrop-blur-md rounded-2xl border border-gray-200/50 self-start md:self-center">
                    {(['all', 'delivered', 'cancelled'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${filter === f ? 'bg-white text-blue-600 shadow-xl shadow-blue-50/50 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {f === 'all' ? 'Entire History' : f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse border border-white"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white transition-all duration-500 hover:shadow-gray-300/50 hover:scale-[1.02] flex flex-col group overflow-hidden">
                            <div className="p-8 pb-4 flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-300 uppercase underline decoration-blue-100 underline-offset-4 tracking-[0.2em] mb-1">Receipt ID</p>
                                    <p className="font-black text-gray-900 text-lg">#{order._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="px-8 py-4 flex-grow">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Request Summary</p>
                                <div className="space-y-2">
                                    {order.items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50/70 p-3 rounded-2xl group-hover:bg-blue-50/30 transition-colors">
                                            <span className="font-bold text-gray-800 truncate">{i.itemName}</span>
                                            <span className="ml-4 bg-white px-2 py-0.5 rounded-lg border border-gray-100 text-[10px] font-black text-blue-600">×{i.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.note && (
                                    <div className="mt-5 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-50/50">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Your Instruction</p>
                                        <p className="text-sm font-medium italic text-indigo-900/70 leading-relaxed">"{order.note}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 pt-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                <div className="flex items-center space-x-2">
                                    <span>🗓️</span>
                                    <span>{new Date(order.orderedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>⏰</span>
                                    <span>{new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-gray-100/30 backdrop-blur-sm rounded-[3.5rem] border-4 border-dashed border-gray-200/50">
                            <div className="text-7xl mb-8 opacity-10">📑</div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Empty Records</h3>
                            <p className="text-gray-400 font-medium">No orders found matching this filter.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
