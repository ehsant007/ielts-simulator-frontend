"use server"

import {
	createTicketMessage,
} from "@/client"

import { getAccessToken } from "@/auth/cookie";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(form: FormData) {
	const message = String(form.get("message"));
	const ticketId = String(form.get("ticket_id"));
	const attachments = form.getAll("attachments")
		.filter((f): f is File => f instanceof File && f.size > 0);

	const res = await createTicketMessage({
		body: {
			message,
			files: attachments.length > 0 ? attachments : undefined,
		},
		path: {
			ticket_id: ticketId,
		},
		throwOnError: false,
		auth: await getAccessToken(),
	});

	//return { data: res.data, error: res.error };
	if(!res.error)
		revalidatePath(`/dashboard/tickets/${ticketId}`)

	return { data: res.data, error: res.error };
}