"use client"

import { QuestionGroupBase as QuestionGroupBaseType, NoteCompletionGroup, QuestionGroup as QuestionGroupType, QuestionGroupVisualLabeling, SentenceMatchingGroup } from "@/client";
import { Content, MD } from "./Content";
import { Question } from "./Question";
import { Box, VStack, Text, Em, HStack, NativeSelect, Separator, Image, List, Center } from "@chakra-ui/react";
import { useModule } from "./ModuleProvider";
import { useColorMode } from "../ui/color-mode";
import { useState } from "react";

export function QuestionGroup({ g }: { g: QuestionGroupType }) {

	let ui
	switch (g.group_type) {
		case "basic": ui = <QuestionGroupBase g={g} />
			break
		case "completion_note": ui = <NoteCompletion g={g} />
			break
		case "visual_labeling": ui = <VisualLabelingGroup>{g}</VisualLabelingGroup>
			break
		case "sentence_matching": ui = <SentenceMatching>{g}</SentenceMatching>
			break
		default:
			ui = <p>{g.group_type}</p>
	}

	return <VStack p="6" alignItems="start">
		<Text><Em>Questions {g.question_range?.[0]}-{g.question_range?.[1]}</Em></Text>
		<Box mb="4">
			<Em>
				<MD>{g.prompt}</MD>
			</Em>
		</Box>
		{ui}
	</VStack>
}

export function NoteCompletion({ g }: { g: NoteCompletionGroup }) {

	const content = (g.content)
	return <Content content={content} ></Content>

}


export function QuestionGroupBase({ g }: { g: QuestionGroupBaseType }) {
	const {getQuestion} = useModule()

	return <VStack alignItems="stretch">
		{
			g.questions.map((q, i) => (
				<Box key={i} mb="4">
					<Question question={getQuestion(q.num)} />
				</Box>
			))
		}
	</VStack>
}

export function VisualLabelingGroup({ children: g }: { children: QuestionGroupVisualLabeling }) {

	const { module, getQuestion } = useModule()
	const { colorMode } = useColorMode()

	return <VStack alignItems="start">

		<Image
			src={`/api/v1/ielts/modules/${module.id}/${g.image}`}
			// filter={`invert(${colorMode === "dark" ? 1 : 0})`}
			mb="6"
		/>

		<VStack alignItems="stretch">
			{
				g.questions.map((question, i) => (
				<Question key={i} question={getQuestion(question.num)} options={g.labels} />
				))
			}
		</VStack>
	</VStack>
}


export function SentenceMatching({ children: g }: { children: SentenceMatchingGroup }) {

	const [selected, setSelected] = useState<Record<string, number | number[]>>({})
	const {getQuestion} = useModule()

	return <VStack alignItems="start">

		
		<VStack alignItems="stretch" ms="auto" border="md" p="6" borderStyle="groove" shadow="lg" borderRadius="md" mb="8">
			<Center fontWeight="bold">{g.sentences_title}</Center>
			{
				Object.keys(g.sentences).map(key => <HStack key={key} bg={selected[key] ? "bg.emphasized" : "none"} mx="0" px="6">
					<Text fontWeight="bold" fontFamily="mono" fontSize="lg">{key}</Text>
					<Text>{g.sentences[key]}</Text>
				</HStack>)
			}
		</VStack>


		<VStack alignItems="stretch">
			{
				g.questions.map((question, i) => (
					<Question key={i} question={getQuestion(question.num)} options={Object.keys(g.sentences)} onChange={(e) => {
						const value = e.currentTarget.value
						setSelected(prev => {
							let new_state = Object.fromEntries(Object.entries(prev).filter(([_, val]) => val !== question.num))
							if (value) {
								new_state = { ...new_state, [value]: question.num }
							}
							return new_state
						})
					}} />
				))
			}
		</VStack>
	</VStack>
}
