"use client"
import { Question as QuestionType } from "@/client"
import { Input } from "@chakra-ui/react"


export function Question({question}: {question: QuestionType}) {
	switch(question.question_type){
		case "completion": return <Completion question={question}/>
	}
	return <>
		{question.type}
	</>
}

export function Completion({question}: {question: QuestionType}) {
	return <>
		<Input />
	</>
}
