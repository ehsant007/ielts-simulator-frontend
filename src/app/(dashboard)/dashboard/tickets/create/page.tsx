"use client"

import {
	FileUpload,
	Heading,
	HStack,
	IconButton,
	Spacer,
	Stack,
	Textarea,
	useFileUpload,
	Button,
	Input,
} from "@chakra-ui/react"

import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { createTicketAction } from "./actions";
import { useTranslations } from "next-intl";
import { FormEvent, useRef, useState } from "react";
import { toaster } from "@/components/ui/toaster";


export default function CreateTicket() {
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

	const attachmentsInput = useRef<HTMLInputElement | null>(null);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsLoading(true);

		const res = await createTicketAction(new FormData(e.currentTarget));
		if (res.error) {
			setError(res.error)
			toaster.create({
				title: "Something went wrong!",
				description: res.error,
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

		<Stack maxW="7xl" gap="3" p="5" minH="100vh" asChild>

			<form onSubmit={handleSubmit}>
				<Heading mb="2">{t("create-ticket-title")}</Heading>
				<Input name="subject" type="text" placeholder={t("subject")} required minLength={3} maxLength={255} />
				<Textarea
					name="message"
					h="10lh"
					p="4"
					placeholder={t("msg-placeholder")}
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
					required
					minLength={3}
					maxLength={20000}
				/>
				<HStack p="2">
					<FileUpload.RootProvider value={attachments}>

						<FileUpload.List showSize clearable />

						<FileUpload.HiddenInput ref={attachmentsInput} name="attachments" />

						<FileUpload.Trigger asChild>
							<IconButton mt="auto" variant="ghost">
								<ImAttachment />
							</IconButton>
						</FileUpload.Trigger>

					</FileUpload.RootProvider>

					<Spacer />
					<Button
						mt="auto"
						variant="ghost"
						alignSelf="end"
						type="submit"
						disabled={isLoading}
					>
						{t("btn-send")} <MdSend />
					</Button>
				</HStack>
			</form>
		</Stack>
	)
}

