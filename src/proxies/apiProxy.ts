import type { NextRequest } from "next/server";
import { COOKIE_ACCESS_TOKEN } from "@/auth";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL;


export const config = {
	matcher: "/api/*path",
};

const HOP_BY_HOP = [
	"host",
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te", // Transfer-Encoding
	"trailers",
	"transfer-encoding",
	"upgrade",
	"x-forwarded-for", // Only relevant if you're forwarding proxies, which you should remove if set by the frontend.
	"x-forwarded-host",
	"x-forwarded-proto"
];

export async function proxy(request: NextRequest) {

	const target = new URL(request.nextUrl.pathname + request.nextUrl.search, API_ORIGIN);

	const headers = new Headers(request.headers);
	for (const h of HOP_BY_HOP)
		headers.delete(h)

	const token = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
	if (token)
		headers.set("authorization", `Bearer ${token}`);

	const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

	const upstream = await fetch(target.toString(), {
		method: request.method,
		headers,
		body,
		redirect: "follow",
	});

	return new Response(upstream.body, { status: upstream.status, headers: upstream.headers });
}