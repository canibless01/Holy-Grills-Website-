import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const orderId = `ord-${Date.now()}`;

  return NextResponse.json(
    {
      data: {
        id: orderId,
        status: "placed",
        ...body,
      },
      message: "Order created",
    },
    { status: 201 }
  );
}
