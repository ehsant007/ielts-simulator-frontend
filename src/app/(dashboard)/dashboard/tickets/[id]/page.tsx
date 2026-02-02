import {
	readTicketById,
	readTicketMessages,
	readUserMe,
} from "@/client"
import { getAccessToken } from "@/auth/cookie";
import MessageForm from "./MessageForm";


export default async function Ticket({ params }: { params: Promise<{ id: string }> }) {
	const ticketId = (await params).id;

	const token = await getAccessToken();

	const user = (await readUserMe({ auth: token })).data;

	const ticket = (await readTicketById({
		path: { ticket_id: ticketId },
		auth: token,
	})).data

	const messages = (await readTicketMessages({
		query: { skip: 0, limit: 100 },
		path: { ticket_id: ticketId },
		auth: token
	})).data

	return (
		<MessageForm  user={user} ticket={ticket} messages={messages}/>
	)
}