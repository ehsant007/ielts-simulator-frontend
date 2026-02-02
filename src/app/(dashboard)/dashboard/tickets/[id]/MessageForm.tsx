"use client"

import {
	Box,
	FileUpload,
	Heading,
	HStack,
	IconButton,
	Separator,
	Spacer,
	Stack,
	Textarea,
	useFileUpload,
	Text,
} from "@chakra-ui/react"


import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";

import { sendMessageAction } from "./actions";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { TicketMessagesRead, TicketRead, UserMe } from "@/client";
import { MdOutlineFileDownload } from "react-icons/md";
import Link from "next/link";
import { DateTime, DateTimeRelative } from "@/components/util/DateTime";


type TicketForm = {
	user: UserMe;
	ticket: TicketRead;
	messages: TicketMessagesRead;
}

export default function MessageForm({ ticket, messages, user }: TicketForm) {

	// const [messages, addMessage] = useOptimistic<TicketMessagesRead, TicketMessageRead>(messages_in, (state, newMessage) => {
	// 	return { data: [...state.data, newMessage], count: state.count + 1 }
	// })

	const t = useTranslations("dashboard.tickets");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const attachments = useFileUpload({
		maxFiles: 5,
		minFileSize: 1,
		maxFileSize: 3 * 1024 * 1024,
		accept: ["image/*", "application/pdf"],
	})
	const [messageInput, setMessageInput] = useState("");

	useEffect(() => {
		window.scrollTo({
			top: document.documentElement.scrollHeight, // or window.innerHeight etc.
			left: 0,
			behavior: "smooth"
		})
	}, [])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const res = await sendMessageAction(new FormData(e.currentTarget));
		if (res.error) {
			const error_detail = JSON.stringify(res.error.detail)
			setError(error_detail)

			toaster.create({
				title: "Something went wrong!",
				description: error_detail,
				type: "error",
				closable: true,
			})

		} else {
			attachments.clearFiles();
			setMessageInput("");
		}

		setIsLoading(false);
	}


	return (

		<Stack gap="6" h="90vh">
			<Heading>{ticket.subject} - #{ticket.id.substring(0, ticket.id.indexOf("-"))}</Heading>

			{
				messages.data.map((msg) => {
					const isMine = msg.sender.username === user.username;

					return (
						<Stack key={msg.id} p="3"
							shadow="md"
							w="70%"
							alignSelf={isMine ? "start" : "end"}
							bg={isMine ? "green.subtle" : "purple.subtle"}
							rounded="xl"
						>
							<Text color="orange.fg" mb="2">
								<Link href="#">
									{msg.sender.username}
								</Link>
							</Text>

							<Text>
								{msg.message}
							</Text>

							{
								(msg.file_set?.files.length ?? 0) > 0 &&
								<>
									<Separator mt="8" />
									<Text color="fg.subtle">{t("attachments")}</Text>
									<HStack>
										{
											msg.file_set?.files.map((attachment) => {
												return (
													<Link key={attachment.id} href={`/api/v1/files/${attachment.id}`}>
														<HStack>
															<MdOutlineFileDownload />{attachment.filename}
														</HStack>
													</Link>
												);
											})
										}
									</HStack>
								</>
							}

							<Text
								fontSize="sm"
								color="fg.subtle"
								alignSelf="end"
								mt="2"
							>
								<DateTime dt={msg.created_at} /> - <DateTimeRelative dt={msg.created_at} />
							</Text>

						</Stack>
					)
				})
			}

			<Spacer mt="36" />

			<Box alignSelf="center" w={{ base: "100%", md: "70%" }} position="sticky" bottom="10" p="4" asChild>
				<form onSubmit={handleSubmit}>
					<Stack
						bg="bg.subtle"
						rounded="xl"
						shadow="xl"
					>
						<input name="ticket_id" value={ticket.id} type="hidden" />

						<Textarea
							name="message"
							p="4"
							autoresize
							maxH="10lh"
							variant="flushed"
							borderBottomWidth="1px"
							placeholder={t("msg-placeholder")}
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
						/>
						<HStack p="2">


							<FileUpload.RootProvider value={attachments}>

								<FileUpload.List showSize clearable />

								<FileUpload.HiddenInput name="attachments" />

								<FileUpload.Trigger asChild>
									<IconButton mt="auto" variant="ghost">
										<ImAttachment />
									</IconButton>
								</FileUpload.Trigger>

							</FileUpload.RootProvider>

							<Spacer />
							<IconButton
								mt="auto"
								variant="ghost"
								alignSelf="end"
								type="submit"
								disabled={isLoading}
							>
								<MdSend />
							</IconButton>
						</HStack>
					</Stack>
				</form>
			</Box>

		</Stack>
	)
}