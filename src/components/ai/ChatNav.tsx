import { AiChatRead } from "@/client";
import { useMessagesQuery } from "./hooks";
import { Button, Menu, Portal } from "@chakra-ui/react";


export function ChatNav({ chat }: { chat: AiChatRead }) {
	const { query: { data: messages = [], isLoading } } = useMessagesQuery(chat.id)

	const userMessages = messages.filter((msg) => msg.role === "user")

	if (isLoading)
		return null

	return (
		<Menu.Root positioning={{ placement: "right-start" }}>
			<Menu.Trigger asChild>
				<Button variant="outline" size="sm">
					Open
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						{userMessages.map((msg) => (
							<Menu.Item cursor="pointer" colorPalette="primary" key={msg.id} value={msg.id}>
								{msg.content.slice(0, 20)}
							</Menu.Item>
						))
						}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	)

}

