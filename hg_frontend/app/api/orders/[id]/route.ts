import { NextResponse } from "next/server";
import { MOCK_ORDERS } from "@/data/mockOrders";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = MOCK_ORDERS.find((item) => item.id === id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}
