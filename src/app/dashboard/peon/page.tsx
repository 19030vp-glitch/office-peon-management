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
        const interval = setInterval(fetchOrders, 5000); // Poll more frequently for Peon
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders?status=pending'); // Fetch pending/active
            // Just fetching all via API logic which defaults to helpful list for peon
            if (res.ok) {
                const data = await res.json();
                // Client side filter if API returns all
                const activeOrders = data.filter((o: Order) => o.status !== 'delivered' && o.status !== 'cancelled');
                setOrders(activeOrders);
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
                fetchOrders(); // Refresh immediately
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSummary = () => {
        const today = new Date().toDateString();
        const todaysOrders = orders.filter(o => new Date(o.orderedAt).toDateString() === today);
        let totalOrders = todaysOrders.length;
        let totalTea = 0;
        let totalCoffee = 0;
        todaysOrders.forEach(o => {
            o.items.forEach(i => {
                if (i.itemName.toLowerCase().includes('tea')) totalTea += i.quantity;
                if (i.itemName.toLowerCase().includes('coffee')) totalCoffee += i.quantity;
            });
        });
        return { totalOrders, totalTea, totalCoffee };
    };

    const summary = getSummary();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Peon Dashboard</h1>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm">Total Orders Today</h3>
                    <p className="text-2xl font-bold">{summary.totalOrders}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm">Total Tea</h3>
                    <p className="text-2xl font-bold">{summary.totalTea}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm">Total Coffee</h3>
                    <p className="text-2xl font-bold">{summary.totalCoffee}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Incoming Orders</h2>
            {loading && orders.length === 0 ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className={`bg-white rounded-lg shadow-lg border-2 overflow-hidden ${order.status === 'pending' ? 'border-yellow-400 animate-pulse-border' : 'border-transparent'}`}>
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{order.employeeName}</h3>
                                    <p className="text-sm text-gray-600">{order.department}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="p-4">
                                <ul className="mb-4 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between font-medium text-lg">
                                            <span>{item.itemName}</span>
                                            <span>x{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>

                                {order.note && (
                                    <div className="bg-yellow-50 p-2 rounded text-sm mb-4 border border-yellow-100 text-yellow-800">
                                        Note: {order.note}
                                    </div>
                                )}

                                <div className="text-xs text-gray-400 mb-4">
                                    Ordered: {new Date(order.orderedAt).toLocaleTimeString()}
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {order.status === 'pending' && (
                                        <button onClick={() => updateStatus(order._id, 'accepted')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold">
                                            Accept
                                        </button>
                                    )}
                                    {order.status === 'accepted' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => updateStatus(order._id, 'in-progress')} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold">
                                                Preparing
                                            </button>
                                            <button onClick={() => updateStatus(order._id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold">
                                                Delivered
                                            </button>
                                        </div>
                                    )}
                                    {order.status === 'in-progress' && (
                                        <button onClick={() => updateStatus(order._id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold">
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-lg shadow">
                            <p className="text-xl text-gray-400">No active orders</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
