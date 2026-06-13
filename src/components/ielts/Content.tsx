"use client"

import { Content as ContentType, Table as TableType, Text as TextType } from "@/client"
import { Box, Center, List, Table, VStack } from "@chakra-ui/react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useModuleStore } from "./ModuleProvider"
import { Question } from "./Question"
import { Text } from "./Text"

export function MD({ children }: { children: string | string[] | null | undefined }) {
	const getQuestion = useModuleStore((state) => state.getQuestion)
	let data
	if (Array.isArray(children))
		data = children.join("\n\n")
	else
		data = children

	return <Markdown rehypePlugins={[rehypeRaw]} components={{
		h1({ children }) {
			return <Text textStyle="4xl" color="question.strong">{children}</Text>
		},
		h2({ children }) {
			return <Text textStyle="3xl" color="question.strong">{children}</Text>
		},
		h3({ children }) {
			return <Text textStyle="2xl" color="question.strong">{children}</Text>
		},
		h4({ children }) {
			return <Text textStyle="xl" color="question.strong">{children}</Text>
		},
		h5({ children }) {
			return <Text textStyle="lg" color="question.strong">{children}</Text>
		},
		h6({ children }) {
			return <Text textStyle="md" color="question.strong">{children}</Text>
		},
		p({ children }) {
			return <Text>{children}</Text>
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

export function Content({ content }: { content: ContentType }) {
	switch (content.type) {
		case "text": return <TextContent>{content}</TextContent>
		case "table": return <TableContent>{content}</TableContent>
	}
}

export function TextContent({ children }: { children: TextType }) {
	return <VStack>
		<Text textStyle="3xl" pb="3">{children.title}</Text>

		<Box>
			<MD>{children.text}</MD>
		</Box>
	</VStack>
}

export function TableContent({ children }: { children: TableType }) {

	const columnCount = Math.max(...children.rows.map((row) => row.length));

	return <VStack>
		<Text textStyle="3xl" pb="3">{children.title}</Text>

		<Table.Root border="md" borderColor="bg.emphasized" fontSize="md" showColumnBorder>
			<Table.Body>
				{
					children.rows.map((row, i) => (
						<Table.Row key={i} bg="none">
							{
								row.map((cell, j) => (
									<Table.Cell key={j} colSpan={columnCount - row.length + 1}>
										<MD>{cell}</MD>
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