import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function verifyAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

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
    const user = await verifyAuth();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query: any = {};

        if (user.role === 'employee') {
            query.employeeId = user.id;
        } else if (user.role === 'peon' || user.role === 'admin') {
            // Default active view for peons/admins: show everything not delivered or cancelled
            if (status) {
                query.status = status;
            } else {
                query.status = { $nin: ['delivered', 'cancelled'] };
            }
        }

        const orders = await Order.find(query).sort({ orderedAt: -1 }).limit(100);
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const user: any = await verifyAuth();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items, note } = await req.json();

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
