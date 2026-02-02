import { getAccessToken } from "@/auth/cookie"

import {
	readTickets,
} from "@/client"

import TicketsTable from "./TicketsTable"
import { Button, Stack } from "@chakra-ui/react";
import { IoCreateOutline } from "react-icons/io5";
import { getTranslations } from "next-intl/server"
import Link from "next/link";

export default async function Tickets() {
	const t = await getTranslations("dashboard.tickets")

	const pageSize = 10;
	const token = await getAccessToken()

	const tickets = (await readTickets({
		query: {
			skip: 0,
			limit: pageSize,
		},
		auth: token,
	})).data

	return (
		<Stack>
			<Button asChild variant="subtle" ms="auto" colorPalette="green">
				<Link href="/dashboard/tickets/create">
					<IoCreateOutline />{t("btn-open-new-ticket")}
				</Link>
			</Button>

			<TicketsTable
				data={tickets}
				pageSize={pageSize}
			/>
		</Stack>
	)
}