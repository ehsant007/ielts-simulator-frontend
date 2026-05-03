"use client"

import { QuestionGroupBase, NoteCompletionGroup, QuestionGroup as QuestionGroupType } from "@/client";
import Markdown from "react-markdown";
import { Content } from "./Content";

export function QuestionGroup({ qg }: { qg: QuestionGroupType }) {
	switch (qg.group_type) {
		case "completion_note": return <NoteCompletion qg={qg} />
		default:
			return <p>{qg.group_type}</p>
	}
}


function injectPlaceholders(text: string) {
	return text.replace(/\{\{q(\d+)\}\}/g, (_, group1) => {
		return `<input id="q${group1}" placeholder="${group1}" style="text-align: center;"/>`
	})
}

function deepReplace(obj: any): any {
	if (typeof obj === "string") return injectPlaceholders(obj)

	if (Array.isArray(obj)) return obj.map(deepReplace)

	if (typeof obj === "object" && obj !== null) {
		const result: any = {}
		for (const key in obj) {
			result[key] = deepReplace(obj[key])
		}
		return result
	}

	return obj
}

export function NoteCompletion({ qg }: { qg: NoteCompletionGroup }) {

	const content = (qg.content)
	return <Content content={content} ></Content>

}
