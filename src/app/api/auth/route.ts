import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Auth API endpoint is ready",
    status: "ok",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    message: "Auth request received",
    data: body,
    status: "ok",
  });
}
