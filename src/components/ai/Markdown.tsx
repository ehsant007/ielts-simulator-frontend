import ReactMarkdown from "react-markdown"

import { Prose } from "./prose"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"


export function Markdown({ children }: { children: string }) {
	return (
		<Prose
			size="lg"
			maxW="unset"
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}

				components={{
					code({ children, className, ...props }) {
						const match = /language-(\w+)/.exec(className || "")

						return match ? (
							<SyntaxHighlighter
								language={match[1]}
								style={oneDark}
								PreTag="div"
							>
								{String(children).replace(/\n$/, "")}
							</SyntaxHighlighter>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						)
					},
				}}
			>
				{children}
			</ReactMarkdown>
		</Prose>
	)
}