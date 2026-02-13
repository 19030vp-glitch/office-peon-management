import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET all users (Admin only)
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE a user (Admin only)
export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 });
        }

        // Don't allow deleting yourself
        if (userId === payload.id) {
            return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
        }

        await dbConnect();
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
