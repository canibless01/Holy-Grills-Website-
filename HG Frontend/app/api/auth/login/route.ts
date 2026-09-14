import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64);
}

function buildMockUser({
  id,
  email,
  password,
  name,
  role,
}: {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin';
}) {
  const salt = randomBytes(16).toString('hex');
  return {
    id,
    email,
    name,
    avatarUrl: null,
    role,
    salt,
    passwordHash: hashPassword(password, salt),
  };
}

function comparePassword(password: string, passwordHash: Buffer, salt: string) {
  const candidate = hashPassword(password, salt);
  return candidate.length === passwordHash.length && timingSafeEqual(candidate, passwordHash);
}

// Mock users for demo purposes
const MOCK_USERS = [
  buildMockUser({ id: 'usr-demo-001', email: 'demo@futa.edu.ng', password: 'password', name: 'Demo User', role: 'customer' }),
  buildMockUser({ id: 'usr-admin-001', email: 'admin@holygrills.ng', password: 'admin123', name: 'Admin User', role: 'admin' }),
];

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && comparePassword(password, u.passwordHash, u.salt)
  );

  if (!user) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  // TODO: Replace this mock token with backend-issued signed auth tokens once auth is wired up.
  const token = `hg_${randomBytes(24).toString('hex')}`;

  return NextResponse.json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    },
    message: 'Login successful',
  });
}
