'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Item {
    _id: string;
    name: string;
    price?: number;
    available: boolean;
    category?: string;
}

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

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll orders every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/items');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch items', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const addToCart = (item: Item) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.itemId === item._id);
            if (existing) {
                return prev.map((i) =>
                    i.itemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { itemId: item._id, itemName: item.name, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((i) => i.itemId !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart((prev) => {
            return prev.map((i) => {
                if (i.itemId === itemId) {
                    const newQty = i.quantity + delta;
                    return newQty > 0 ? { ...i, quantity: newQty } : i;
                }
                return i;
            });
        });
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setPlacingOrder(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart, note }),
            });

            if (res.ok) {
                setCart([]);
                setNote('');
                fetchOrders();
                alert('Order placed successfully!');
            } else {
                alert('Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order', error);
            alert('Error placing order');
        } finally {
            setPlacingOrder(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Place New Order</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                        {items.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => addToCart(item)}
                                className="p-4 border rounded hover:bg-blue-50 transition flex flex-col items-center justify-center text-center h-24"
                            >
                                <span className="font-semibold">{item.name}</span>
                                {item.price && <span className="text-xs text-gray-500">₹{item.price}</span>}
                            </button>
                        ))}
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Cart</h3>
                            <ul className="space-y-2 mb-4">
                                {cart.map((item) => (
                                    <li key={item.itemId} className="flex justify-between items-center">
                                        <span>{item.itemName}</span>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => updateQuantity(item.itemId, -1)} className="px-2 bg-gray-200 rounded">-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.itemId, 1)} className="px-2 bg-gray-200 rounded">+</button>
                                            <button onClick={() => removeFromCart(item.itemId)} className="text-red-500 ml-2">x</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <textarea
                                placeholder="Add note (e.g., 'Less sugar')"
                                className="w-full border rounded p-2 mb-4"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button
                                onClick={placeOrder}
                                disabled={placingOrder}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
                            >
                                {placingOrder ? 'Placing Order...' : 'Confirm Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Active Orders</h2>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} uppercase`}>
                                        {order.status}
                                    </span>
                                    <span className="text-gray-500 text-xs ml-2">
                                        {new Date(order.orderedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm">
                                {order.items.map((i, idx) => (
                                    <span key={idx} className="block">
                                        {i.quantity} x {i.itemName}
                                    </span>
                                ))}
                            </div>
                            {order.note && (
                                <div className="mt-2 text-xs text-gray-600 italic">
                                    Note: {order.note}
                                </div>
                            )}
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <p className="text-gray-500">No active orders.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
