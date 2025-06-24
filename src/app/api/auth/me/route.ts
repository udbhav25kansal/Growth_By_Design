import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
// We will parse cookies manually from the request headers to avoid type mismatches.
import { UserService } from '@/backend/services/userService';

export async function GET(req: Request) {
  try {
    const token = cookies().get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jose.jwtVerify(token, secretKey) as { payload: { id: number }};

    const user = await UserService.getUserById(payload.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 