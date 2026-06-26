"use server"

import { getAccessToken } from "@/auth/cookie"

import {
	readWordnet,
} from "@/client"


export async function getWordNetData(word: string)
{
	const token = await getAccessToken()

	const data = (await readWordnet({
		path: {
			word
		},
		auth: token,
	})).data

	return data; 
}