'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const navLinks = [];

    // Dashboard link for all roles
    navLinks.push({
        href: `/dashboard/${user.role}`,
        label: 'Dashboard',
    });

    // Admin-specific links
    if (user.role === 'admin') {
        navLinks.push({
            href: '/dashboard/admin/users',
            label: 'Users',
        });
    }

    // Employee-specific links
    if (user.role === 'employee') {
        navLinks.push({
            href: '/dashboard/employee/history',
            label: 'History',
        });
    }

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href={`/dashboard/${user.role}`} className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ☕ OfficeOrders
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block">
                            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-semibold uppercase tracking-wider bg-blue-100 text-blue-800">
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
