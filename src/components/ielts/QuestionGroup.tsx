"use client"

import { QuestionGroupBase as QuestionGroupBaseType, NoteCompletionGroup, QuestionGroup as QuestionGroupType } from "@/client";
import { Content } from "./Content";
import { Question } from "./Question";
import { Box } from "@chakra-ui/react";

export function QuestionGroup({ g }: { g: QuestionGroupType }) {

	let ui

	switch (g.group_type) {
		case "basic": ui = <QuestionGroupBase g={g} />
			break
		case "completion_note": ui = <NoteCompletion g={g} />
			break
		default:
			ui = <p>{g.group_type}</p>
	}

	return <Box p="6">
		{ui}
	</Box>
}

export function NoteCompletion({ g }: { g: NoteCompletionGroup }) {

	const content = (g.content)
	return <Content content={content} ></Content>

}


export function QuestionGroupBase({ g }: { g: QuestionGroupBaseType }) {

	return <>
		{
			g.questions.map((q, i) => (
				<Box py="4">
					<Question key={i} question={q} />
				</Box>
			))
		}
	</>
}