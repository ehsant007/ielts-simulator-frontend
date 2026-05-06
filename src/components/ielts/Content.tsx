"use client"

import { Content as ContentType } from "@/client"
import { Input, Text } from "@chakra-ui/react"
import React from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useModule } from "./ModuleProvider"
import { Question } from "./Question"

export function MD({ children }: { children: string | string[] | null | undefined }) {
	const { module } = useModule()
	let data
	if (Array.isArray(children))
		data = children.join("\n\n")
	else
		data = children

	return <Markdown components={{
		h1({ children }) {
			return <Text textStyle="4xl">{children}</Text>
		},
		h2({ children }) {
			return <Text textStyle="3xl">{children}</Text>
		},
		h3({ children }) {
			return <Text textStyle="2xl">{children}</Text>
		},
		h4({ children }) {
			return <Text textStyle="xl">{children}</Text>
		},
		h5({ children }) {
			return <Text textStyle="lg">{children}</Text>
		},
		h6({ children }) {
			return <Text textStyle="md">{children}</Text>
		},
		p({ children }) {
			return <Text>{children}</Text>
		},
		code({ children }) {

			if (typeof children !== "string") {
				return children
			}

			const qid = children.match(/^\{\{(q\d+)\}\}/)?.[1]
			if (!qid)
				return children

			return <Question question={module.questions[qid]} />
		}
	}} >
		{data}
	</Markdown>
}

export function Content({ content }: { content: ContentType }) {
	const { module } = useModule()

	switch (content.type) {
		case "text": return <MD>{content.text}</MD>
		case "table": return content.type
	}
}