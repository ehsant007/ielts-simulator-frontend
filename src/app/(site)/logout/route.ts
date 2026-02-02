import { logout } from "@/auth/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	await logout();

	const baseUrl = new URL(request.url).origin;

	const from = "/dashboard";//encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);

	return NextResponse.redirect(`${baseUrl}/login?from=${from}`);
}