"use client"

import { ModuleRead, ListeningContent } from "@/client";
import { QuestionGroup } from "./QuestionGroup"

export function ListeningModule({ module }: { module: ModuleRead }) {

	const content = module.content as ListeningContent

	return (
		<>
			<h1>
				{module.content.type}
			</h1>

			<br />

			{
				content.parts.map((part, i) => <div key={i}>
					<h1>Part {i + 1}</h1>
					{part.test.map((qg, i) => <QuestionGroup qg={qg} key={i}/>)}
					<br />
				</div>)
			}
		</>
	)
}