"use client"

import { Content as ContentType, Table as TableType, Text as TextType } from "@/client"
import { Box, Center, List, Table, VStack, Text } from "@chakra-ui/react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useModuleStore } from "./ModuleProvider"
import { Question } from "./Question"
import { Text as AdvText } from "./Text"

export function MD({ children, id }: { children: string | string[] | null | undefined, id: string }) {
	const getQuestion = useModuleStore((state) => state.getQuestion)
	let data
	if (Array.isArray(children))
		data = children.join("\n\n")
	else
		data = children

	return <Markdown rehypePlugins={[rehypeRaw]} components={{
		h1({ children }) {
			return <AdvText id={id} textStyle="4xl" color="question.strong">{children}</AdvText>
		},
		h2({ children }) {
			return <AdvText id={id} textStyle="3xl" color="question.strong">{children}</AdvText>
		},
		h3({ children }) {
			return <AdvText id={id} textStyle="2xl" color="question.strong">{children}</AdvText>
		},
		h4({ children }) {
			return <AdvText id={id} textStyle="xl" color="question.strong">{children}</AdvText>
		},
		h5({ children }) {
			return <AdvText id={id} textStyle="lg" color="question.strong">{children}</AdvText>
		},
		h6({ children }) {
			return <AdvText id={id} textStyle="md" color="question.strong">{children}</AdvText>
		},
		p({ children }) {
			return <AdvText id={id}>{children}</AdvText>
		},
		ul({ children }) {
			return <List.Root ps="5">{children}</List.Root>
		},
		li({ children }) {
			return <List.Item>{children}</List.Item>
		},
		code({ children }) {

			if (typeof children !== "string") {
				return children
			}

			const question_num = children.match(/^\{\{q(\d+)\}\}/)?.[1]
			if (!question_num)
				return children

			return <Question question={getQuestion(Number.parseInt(question_num))} />
		},
		strong({ children }) {
			return <Text as="span" fontWeight="bold" color="question.strong">{children}</Text>
		},
		center({ children }) {
			return <Center as="span">{children}</Center>
		},
	}} >
		{data}
	</Markdown>
}

export function Content({ content, id }: { content: ContentType, id: string }) {
	switch (content.type) {
		case "text": return <TextContent id={id}>{content}</TextContent>
		case "table": return <TableContent id={id}>{content}</TableContent>
	}
}

export function TextContent({ children, id }: { children: TextType, id: string }) {
	return <VStack>
		<AdvText id={`${id}_title`} textStyle="3xl" pb="3">{children.title}</AdvText>

		<Box>
			<MD id={id}>{children.text}</MD>
		</Box>
	</VStack>
}

export function TableContent({ children, id }: { children: TableType, id: string }) {

	const columnCount = Math.max(...children.rows.map((row) => row.length));

	return <VStack>
		<AdvText id={`${id}_title`} textStyle="3xl" pb="3">{children.title}</AdvText>

		<Table.Root border="md" borderColor="bg.emphasized" fontSize="md" showColumnBorder>
			<Table.Body>
				{
					children.rows.map((row, i) => (
						<Table.Row key={i} bg="none">
							{
								row.map((cell, j) => (
									<Table.Cell key={j} colSpan={columnCount - row.length + 1}>
										<MD id={`${id}_table_${i}_${j}`}>{cell}</MD>
									</Table.Cell>
								))
							}
						</Table.Row>
					))
				}
			</Table.Body>
		</Table.Root>

	</VStack>
}