import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { UserService } from '@/backend/services/userService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await UserService.createUser({ name, email, password_hash });

    // Generate JWT token and automatically sign the user in after successful signup
    const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
    const secretKey = new TextEncoder().encode(secret);
    const token = await new jose.SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sign up' }, { status: 500 });
  }
} 