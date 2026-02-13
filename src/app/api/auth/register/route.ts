import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        // Verify admin token
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return NextResponse.json(
                { message: 'Only admins can create users' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { name, email, password, role, department } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 400 }
            );
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department: department || '',
            createdBy: payload.id,
        });

        return NextResponse.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
