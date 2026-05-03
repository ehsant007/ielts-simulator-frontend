"use client"

import { Content as ContentType } from "@/client"
import { Input, Text } from "@chakra-ui/react"
import React from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"

export function Content0({ content }: { content: ContentType }) {
	switch (content.type) {
		case "text": return <Markdown rehypePlugins={[rehypeRaw]} >{content.text.join("\n\n")}</Markdown>
		case "table": return content.type
	}
}



export function Content({ content }: { content: ContentType }) {
	switch (content.type) {
		case "text": return <Markdown components={{
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

				const qn = children.match(/^\{\{q(\d+)\}\}/)?.[1]
				if (!qn)
					return children

				return <Input
					id={`q${qn}`}
					w="auto"
					textAlign="center"
					placeholder={qn}
					m="2"
				/>
			}
		}} >
			{content.text.join("\n\n")}
		</Markdown>
		case "table": return content.type
	}
}