import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Middleware verification helper
async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'admin') return null;
        return payload;
    } catch (e) {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    try {
        // Fetch all items for admin, maybe filter for employees elsewhere
        const items = await Item.find({}).sort({ name: 1 });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const admin = await verifyAdmin();
    if (!admin) {
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

export async function PUT(req: Request) {
    await dbConnect();
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, available, price, name } = await req.json();
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { available, price, name },
            { new: true }
        );

        if (!updatedItem) return NextResponse.json({ message: 'Item not found' }, { status: 404 });

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) return NextResponse.json({ message: 'Item not found' }, { status: 404 });

        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
