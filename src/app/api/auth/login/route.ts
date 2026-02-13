import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        );

        const response = NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
        });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
