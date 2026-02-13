import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const user = await verifyAuth(req);
    if (!user || (user.role !== 'peon' && user.role !== 'admin')) {
        return NextResponse.json({ message: 'Unauthorized: Only Peon/Admin can update status' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { status } = await req.json(); // 'accepted', 'in-progress', 'delivered'

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        order.status = status;
        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
