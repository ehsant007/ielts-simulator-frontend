'use server';

import { cookies } from 'next/headers';
import { COOKIE_ACCESS_TOKEN } from './index';

export async function getAccessToken() {
	return (await cookies()).get(COOKIE_ACCESS_TOKEN)?.value || undefined;
}

export async function setAccessToken(token: string) {
	(await cookies()).set(COOKIE_ACCESS_TOKEN, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
	});
}

export async function delAccessToken() {
	(await cookies()).delete(COOKIE_ACCESS_TOKEN);
}
