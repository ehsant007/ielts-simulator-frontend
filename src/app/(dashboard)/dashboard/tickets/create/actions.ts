"use server"

import { getAccessToken } from "@/auth/cookie";
import {
	createTicket,
	TicketRead,
} from "@/client"
import { redirect } from "next/navigation";

export async function createTicketAction(fd: FormData) {
	const subject = fd.get("subject");
	const message = fd.get("message");
	const files = fd.getAll("attachments")
		.filter((f): f is File => f instanceof File && f.size > 0)

	let ticket: TicketRead;

	try {
		ticket = (await createTicket({
			body: {
				subject: subject as string,
				message: message as string,
				files: files
			},
			auth: await getAccessToken(),
		})).data

		//return { data: ticket, error: undefined }
	} catch (e) {
		console.error(e)
		return { data: undefined, error: "Couldn't create ticket." }
	}

	redirect(`/dashboard/tickets/${ticket.id}`)
}
