"use client"

import { Content as ContentType, Text as TextType } from "@/client"
import { Box, List, Text, VStack } from "@chakra-ui/react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useModuleStore } from "./ModuleProvider"
import { Question } from "./Question"

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
	}} >
		{data}
	</Markdown>
}

export function Content({ content }: { content: ContentType }) {
	switch (content.type) {
		case "text": return <TextContent>{content}</TextContent>
		case "table": return content.type
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