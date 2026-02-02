'use server'

import type { UserMe, BodyLoginAccessToken, UserRegister, UserPublic } from "@/client"
import { loginAccessToken, readUserMe, registerUser } from "@/client"
import { setAccessToken, delAccessToken, getAccessToken } from "./cookie"
import { redirect } from "next/navigation"


export type User = UserMe
export type Credential = BodyLoginAccessToken

export type LoginResult = {
	user?: User;
	error?: string;
}

export type SignupResult = {
	user?: UserPublic;
	error?: string;
}


function parseError(err: unknown): string {
	if (typeof err === "string") return err;

	if (err instanceof Error) return err.message;

	if (typeof err === "object" && err !== null) {
		const detail = (err as { detail?: unknown }).detail;

		if (!detail) return "Something went wrong!";

		if (typeof detail === "string") return detail;

		if (Array.isArray(detail) && detail.length > 0) {
			return detail
				.map((e) => {
					if (typeof e === "object" && e !== null && "msg" in e)
						return (e as { msg?: string }).msg ?? JSON.stringify(e);
					return JSON.stringify(e);
				})
				.join("; ");
		}

		return JSON.stringify(detail);
	}

	return "Something went wrong!";
}


export async function signup(data: UserRegister): Promise<SignupResult> {
	try {
		const res = await registerUser({ body: data });
		return { user: res.data };
	} catch (e) {
		return { error: parseError(e) };
	}
}


export async function login(cred: Credential): Promise<LoginResult> {
	console.log(cred.username, cred.password);
	try {
		const response = await loginAccessToken({ body: cred });
		await setAccessToken(response.data.access_token);
		const data = await readUserMe({ auth: response.data.access_token });
		return { user: data.data };
	} catch (e) {
		return { error: parseError(e) };
	}
}


export async function logout(redirectTo: string | undefined = undefined) {
	await delAccessToken();
	if (redirectTo)
		redirect(redirectTo);
}


export async function getUser(): Promise<User | undefined> {

	const token = await getAccessToken();

	if (!token)
		return undefined;

	const res = await readUserMe({
		throwOnError: false,
		auth: token,
	});

	if (res.data)
		return res.data;

	return undefined;
}

export async function isLoggedIn() {
	return (await getAccessToken()) !== undefined;
}
