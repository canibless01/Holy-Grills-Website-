import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload?.total || !payload?.method || payload?.hp === undefined) {
    return NextResponse.json({ message: "Invalid payment payload" }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      total: payload.total,
      method: payload.method,
      hp: payload.hp,
      status: "success",
      reference: `pay_${Date.now()}`,
    },
  });
}
