import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User'; // Ensure User model is registered
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

async function verifyAuth(req: Request) {
    const token = (await headers()).get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (e) {
        return null;
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        let query = {};
        if (user.role === 'employee') {
            query = { employeeId: user.id };
        } else if (user.role === 'peon') {
            // Peons see pending and in-progress, or all for today?
            // Let's return non-delivered for active view, strict filtering can be done in UI or separate param
            const url = new URL(req.url);
            const status = url.searchParams.get('status');
            if (status) {
                query = { status };
            }
        }

        // Sort by newest first
        const orders = await Order.find(query).sort({ orderedAt: -1 }).limit(100);
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const user: any = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items, note } = await req.json(); // items: [{ itemId, quantity, itemName }]

        // Fetch full user details for denormalization if needed, 
        // but we can trust token info if it has name/dept. 
        // Actually token only has id/role usually.
        // Let's fetch user to get name/dept.
        const dbUser = await User.findById(user.id);
        if (!dbUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const order = await Order.create({
            employeeId: user.id,
            employeeName: dbUser.name,
            department: dbUser.department,
            items,
            note,
            status: 'pending'
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
