import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, password, phone_number } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
  }

  // In a real app you'd persist to a database. For demo, just return a new user.
  const userId = `usr-${Date.now()}`;
  // TODO: Replace this mock token with backend-issued signed auth tokens once auth is wired up.
  const token = `hg_${randomBytes(24).toString('hex')}`;

  return NextResponse.json(
    {
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          phone: phone_number ?? null,
          avatarUrl: null,
          role: 'customer',
        },
      },
      message: 'Account created successfully',
    },
    { status: 201 }
  );
}
