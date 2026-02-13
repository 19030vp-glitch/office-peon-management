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
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                // Filter for non-delivered and non-cancelled orders for dashboard view
                const active = data.filter((o: Order) =>
                    o.status !== 'delivered' && o.status !== 'cancelled'
                ).slice(0, 5); // Just show top 5 active
                setActiveOrders(active);
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
                fetchActiveOrders();
                alert('Order placed successfully!');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order', error);
            alert('Error connecting to server');
        } finally {
            setPlacingOrder(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">How can we help today?</h1>
                    <p className="text-gray-500 mt-1">Select items from the menu below to place your order.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Menu Section */}
                <div className="lg:col-span-2 space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="h-40 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => addToCart(item)}
                                    disabled={!item.available}
                                    className={`group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between h-48 ${!item.available ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {item.name.toLowerCase().includes('tea') ? '🍵' :
                                                item.name.toLowerCase().includes('coffee') ? '☕' :
                                                    item.name.toLowerCase().includes('water') ? '💧' : '🍰'}
                                        </div>
                                        {!item.available && (
                                            <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded-full uppercase">Sold Out</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                        {item.price && <p className="text-blue-600 font-bold mt-1">₹{item.price}</p>}
                                    </div>
                                    <div className="absolute right-4 bottom-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg">
                                        <span className="text-xl">+</span>
                                    </div>
                                </button>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400">The menu is currently empty. Contact your admin.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Orders Horizontal Scroll / List */}
                    <div className="pt-8 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="mr-2">🕒</span> Active Tracking
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeOrders.map((order) => (
                                <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((i, idx) => (
                                            <p key={idx} className="text-sm text-gray-700 font-medium">
                                                {i.quantity}x {i.itemName}
                                            </p>
                                        ))}
                                    </div>
                                    {order.note && <p className="mt-2 text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">"{order.note}"</p>}
                                </div>
                            ))}
                            {activeOrders.length === 0 && (
                                <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">No active orders right now.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 sticky top-24 overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center relative">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">🛒</span>
                            Your Cart
                        </h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="text-5xl mb-4 grayscale opacity-20">🥡</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
                                <p className="text-sm text-gray-400">Select snacks from the menu to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 flex flex-col h-[calc(100vh-350px)]">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                    {cart.map((item) => (
                                        <div key={item.itemId} className="flex items-center justify-between group">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 leading-tight">{item.itemName}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, -1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-90 transition-all font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-90 transition-all font-bold"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.itemId)}
                                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Special Instructions</label>
                                        <textarea
                                            placeholder="Example: Less sugar, extra hot..."
                                            className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none h-24 text-gray-900 placeholder-gray-400"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={placeOrder}
                                        disabled={placingOrder}
                                        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-100 transform active:scale-[0.98] transition-all flex items-center justify-center ${placingOrder ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {placingOrder ? (
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : null}
                                        {placingOrder ? 'Placing Order...' : 'Confirm Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
