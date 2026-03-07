import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: false,
    error: "CheapShark blocked the request with Cloudflare. We need to switch to another deals source.",
  });
}