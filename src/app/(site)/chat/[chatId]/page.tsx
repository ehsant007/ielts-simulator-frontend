import { ChatPanel } from "@/components/ai/chat"

export default async function Chat({ params }: { params: Promise<{ chatId: string }> }) {
	const chatId = (await params).chatId
	return <ChatPanel initialChatId={chatId} />
}