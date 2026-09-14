import { NextResponse } from "next/server";
import { MOCK_MENU } from "@/data/menu";

export async function GET() {
  return NextResponse.json({ data: MOCK_MENU });
}
