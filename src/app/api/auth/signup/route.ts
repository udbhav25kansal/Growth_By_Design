import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
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

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sign up' }, { status: 500 });
  }
} 