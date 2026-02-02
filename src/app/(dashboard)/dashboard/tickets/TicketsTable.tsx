"use client"

import {
	Button,
	ButtonGroup,
	Heading,
	IconButton,
	Pagination,
	Stack,
	Table,
} from "@chakra-ui/react"

import {
	TicketsRead,
} from "@/client"

import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

import { useState } from "react"

import { getTicketsAction } from "./actions"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { DateTime, DateTimeRelative } from "@/components/util/DateTime"

type TicketsViewProps = {
	data: TicketsRead;
	onNextPage?: (page: number) => void;
	pageSize: number;
	page?: number;
}

export default function TicketsTable({ data, pageSize = 10 }: TicketsViewProps) {
	const t= useTranslations("dashboard.tickets")
	const [tickets, setTickets] = useState<TicketsRead>(data);
	const [currentPage, setCurrentPage] = useState(1);
	const router = useRouter();
	

	const goToPage = async (page: number) => {
		try {
			const data = await getTicketsAction(page, pageSize);
			setTickets(data);
			setCurrentPage(page);
		} catch {
			console.log("Failed to read tickets.");
		}
	}

	return (

		<Stack width="full" gap="5">
			<Heading size="xl">{t("tickets")}</Heading>
			<Table.Root size="sm" variant="line" interactive>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>{t("subject")}</Table.ColumnHeader>
						<Table.ColumnHeader>{t("status")}</Table.ColumnHeader>
						<Table.ColumnHeader textAlign="end">{t("createdAt")}</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body cursor="pointer">
					{tickets.data.map((ticket) => (
						<Table.Row
							key={ticket.id}
							onClick={() => { router.push(`/dashboard/tickets/${ticket.id}`) }}
						>
							<Table.Cell>{ticket.subject}</Table.Cell>
							<Table.Cell>{t(ticket.status)}</Table.Cell>
							<Table.Cell textAlign="end">
								<DateTime dt={ticket.updated_at} /> - <DateTimeRelative dt={ticket.updated_at} />
							</Table.Cell>
						</Table.Row> 
					))}
				</Table.Body>
			</Table.Root>

			<Pagination.Root count={tickets.count} pageSize={pageSize}>
				<ButtonGroup variant="ghost" size="sm" wrap="wrap">
					<Pagination.PrevTrigger asChild>
						<IconButton onClick={() => goToPage(currentPage - 1)}>
							<LuChevronLeft />
						</IconButton>
					</Pagination.PrevTrigger>

					<Pagination.Items
						render={(page) => (
							<Button
								variant={{ base: "ghost", _selected: "outline" }}
								onClick={() => goToPage(page.value)}
							>
								{page.value}
							</Button>
						)}
					/>

					<Pagination.NextTrigger asChild>
						<IconButton onClick={() => goToPage(currentPage + 1)}>
							<LuChevronRight />
						</IconButton>
					</Pagination.NextTrigger>
				</ButtonGroup>
			</Pagination.Root>
		</Stack>
	)

}