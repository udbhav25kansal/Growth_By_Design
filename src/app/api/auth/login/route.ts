import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { UserService } from '@/backend/services/userService';

const TOKEN_NAME = 'auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await UserService.getUserByEmail(email);
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
    const secretKey = new TextEncoder().encode(secret);
    const token = await new jose.SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name });
    res.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Failed to login' }, { status: 500 });
  }
} 