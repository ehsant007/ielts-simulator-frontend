"use server"

import { getAccessToken } from "@/auth/cookie"

import {
	readTickets,
} from "@/client"


export async function getTicketsAction(page:number, pageSize: number)
{
	const token = await getAccessToken()

	const tickets = (await readTickets({
		query: {
			skip: (page-1) * pageSize,
			limit: pageSize,
		},
		auth: token,
	})).data

	return tickets; 
}