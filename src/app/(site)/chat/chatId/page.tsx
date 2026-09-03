import { ChatPanel } from "@/components/ai/chat";

export default async function Chat({ params }: { params: Promise<{ chatId: string }> }) {
	const chat_id = (await params).chatId;

	return (
		<ChatPanel chatId={chat_id} />
	)
}