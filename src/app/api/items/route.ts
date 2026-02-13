import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

// Middleware verification helper (simplified for API routes)
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

export async function GET() {
    await dbConnect();
    try {
        const items = await Item.find({ available: true });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const item = await Item.create(body);
        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
