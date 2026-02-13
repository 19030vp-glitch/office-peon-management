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
                const active = data.filter((o: Order) =>
                    o.status !== 'delivered' && o.status !== 'cancelled'
                ).slice(0, 5);
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Place Your Order</h1>
                    <p className="text-gray-500 mt-2 font-medium">Select items from the menu and we'll bring them to your desk.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Menu Section */}
                <div className="lg:col-span-3 space-y-12">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <div key={n} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => addToCart(item)}
                                    disabled={!item.available}
                                    className={`group relative p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 text-left flex flex-col justify-between h-52 outline-none focus:ring-4 focus:ring-blue-100 ${!item.available ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                                            {item.name.toLowerCase().includes('tea') ? '🍵' :
                                                item.name.toLowerCase().includes('coffee') ? '☕' :
                                                    item.name.toLowerCase().includes('water') ? '💧' : '🍰'}
                                        </div>
                                        {!item.available && (
                                            <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">Sold Out</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{item.name}</h3>
                                        <p className="text-blue-600 font-black text-lg mt-1">
                                            {item.price ? `₹${item.price}` : <span className="text-green-600">Free</span>}
                                        </p>
                                    </div>
                                    <div className="absolute right-6 bottom-6 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl shadow-blue-200">
                                        <span className="text-2xl font-bold">+</span>
                                    </div>
                                </button>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-full py-24 text-center bg-gray-100/50 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-gray-200/50">
                                    <div className="text-6xl mb-4 opacity-10">🥡</div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-1">Our menu is resting</h3>
                                    <p className="text-gray-400 font-medium">Check back soon for delicious treats.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Tracking List */}
                    <div className="pt-10 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center">
                                <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4 text-sm">🚚</span>
                                Active Orders
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeOrders.map((order) => (
                                <div key={order._id} className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 group">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">
                                            {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {order.items.map((i, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl">
                                                <span className="font-bold text-gray-800">{i.itemName}</span>
                                                <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-100 text-xs font-black text-blue-600">×{i.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.note && (
                                        <div className="mt-4 text-[11px] text-gray-500 font-medium italic bg-orange-50/30 p-3 rounded-2xl border border-orange-50">
                                            "{order.note}"
                                        </div>
                                    )}
                                </div>
                            ))}
                            {activeOrders.length === 0 && (
                                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold tracking-tight">No active orders. Hungry yet?</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Glassmorphism Cart Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 sticky top-24 overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center relative">
                            <span className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center mr-4 text-xs shadow-lg shadow-blue-100">🛒</span>
                            Selection
                        </h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-20 px-4 relative">
                                <div className="text-6xl mb-6 grayscale opacity-10">🍜</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Cart is empty</h3>
                                <p className="text-sm text-gray-400 font-medium">Select some treats to see them here.</p>
                            </div>
                        ) : (
                            <div className="space-y-8 flex flex-col h-[calc(100vh-400px)] relative">
                                <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.itemId} className="flex flex-col space-y-3 group">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-gray-900 text-lg leading-tight flex-1">{item.itemName}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.itemId)}
                                                    className="ml-4 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.itemId, -1)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 active:scale-90 transition-all font-black text-xl shadow-sm"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center text-lg font-black text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.itemId, 1)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 active:scale-90 transition-all font-black text-xl shadow-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Special Notes</label>
                                        <textarea
                                            placeholder="Eg: Extra hot, very sweet..."
                                            className="w-full bg-gray-50 border-gray-100 rounded-[2rem] p-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none h-32 text-gray-900 placeholder-gray-300"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={placeOrder}
                                        disabled={placingOrder}
                                        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-5 px-8 rounded-[2rem] shadow-2xl shadow-blue-200 transform active:scale-[0.97] transition-all flex items-center justify-center uppercase tracking-widest text-xs h-16 ${placingOrder ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {placingOrder ? (
                                            <div className="flex items-center">
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                                Processing...
                                            </div>
                                        ) : 'Send to Kitchen'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
