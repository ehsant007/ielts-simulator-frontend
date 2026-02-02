import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESS_TOKEN } from "@/auth";


export const config = {
	matcher: "/dashboard{/*path}",
};


export function proxy(request: NextRequest) {
	const token = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
	if (!token)
		return NextResponse.redirect(new URL('/login', request.url));
	return NextResponse.next()
}
