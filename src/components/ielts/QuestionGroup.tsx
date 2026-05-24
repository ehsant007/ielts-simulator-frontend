"use client"

import type { QuestionGroupBase, NoteCompletionGroup, QuestionGroup, VisualLabelingGroup, SentenceMatchingGroup, IdentifyInfoGroup, ParagraphMatchingGroup, ReadingContent } from "@/client";
import { Content, MD } from "./Content";
import { Question } from "./Question";
import { Box, VStack, Text, HStack, Image, Center, Table, Wrap } from "@chakra-ui/react";
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { useColorMode } from "../ui/color-mode";
import { useEffect, useState } from "react";
import { getModuleFile } from "./utils";
import { useDraggable, DragOverlay, DragDropProvider } from '@dnd-kit/react';

export function QuestionGroup({ g }: { g: QuestionGroup }) {
	let ui
	switch (g.group_type) {
		case "basic":
			ui = <QuestionGroupBase g={g} />
			break
		case "completion_note":
			ui = g.options ? <NoteCompletionWithOptions g={g} /> : <NoteCompletion g={g} />
			break
		case "visual_labeling":
			ui = <VisualLabelingGroup>{g}</VisualLabelingGroup>
			break
		case "sentence_matching":
			ui = <SentenceMatching>{g}</SentenceMatching>
			break
		case "identify_info":
			ui = <IdentifyInfoGroup>{g}</IdentifyInfoGroup>
			break
		case "paragraph_matching":
			ui = <ParagraphMatchingGroup>{g}</ParagraphMatchingGroup>
			break
		default:
			ui = <p>{g.group_type}</p>
	}

	return <VStack alignItems="start">
		<Text fontStyle="italic" fontWeight="bold">
			Questions {g.question_range?.[0]}-{g.question_range?.[1]}
		</Text>
		<Box mb="4" fontStyle="italic">
			<MD>{g.prompt}</MD>
		</Box>
		{ui}
	</VStack>
}

export function NoteCompletion({ g }: { g: NoteCompletionGroup }) {
	return (
		<Box p="3">
			<Content content={g.content} ></Content>
		</Box>
	)
}


export function NoteCompletionWithOptions({ g }: { g: NoteCompletionGroup }) {

	const answers = useModuleStoreApi().getState().answers
	const setAnswer = useModuleStore((state) => state.setAnswer)

	const [selected, setSelected] = useState<Record<number, string>>({})
	const select = (questionNum: number, option: string) => {
		setSelected(prev => ({ ...prev, [questionNum]: option }))
	}


	useEffect(() => {
		g.questions.forEach((q) => {
			if (answers[q.num])
				select(q.num, answers[q.num][0])
		})
	}, [])

	// Draggable Option
	function Option({ children: option }: { children: string }) {
		const { ref } = useDraggable({ id: option });

		const isSelected = Object.values(selected).includes(option)



		return (
			<Box shadow="md">
				
					<Text
						ref={isSelected? undefined : ref}
						cursor="pointer"
						
						px="3"
						py="2"
						bg={isSelected ? "transparent" : "bg"}
						border="md"
						borderColor={isSelected ? "transparent" : "fg.subtle"}
						color={isSelected ? "fg.subtle" : "fg"}
					>
						{option}
					</Text>
				
			</Box>
		);
	}



	return (
		<DragDropProvider
			onDragEnd={(event) => {
				if (event.canceled)
					return;

				const { target, source } = event.operation;

				if (target && source) {
					const qNum = Number(target.id)
					setAnswer(qNum, [source.id.toString() ?? ""])
					select(qNum, source.id.toString())
				}
			}}
		>

			<Box p="3">
				{g.options &&
					<Wrap mb="10" justifyContent="center">
						{
							g.options.map((option) => (

								<Option key={option}>{option}</Option>
							)
							)
						}
					</Wrap>
				}
				<Content content={g.content} ></Content>
			</Box>

		</DragDropProvider>
	);
}


export function QuestionGroupBase({ g }: { g: QuestionGroupBase }) {
	const getQuestion = useModuleStore((state) => state.getQuestion)

	return <VStack alignItems="stretch">
		{
			g.questions.map((q) => (
				<Box key={q.num} mb="4">
					<Question question={getQuestion(q.num)} />
				</Box>
			))
		}
	</VStack>
}

export function VisualLabelingGroup({ children: g }: { children: VisualLabelingGroup }) {
	const module1 = useModuleStore((state) => state.module)
	const getQuestion = useModuleStore((state) => state.getQuestion)
	const { colorMode } = useColorMode()

	return <VStack alignItems="start">

		<Image
			src={getModuleFile(module1.id, g.image)}
			filter={`invert(${colorMode === "dark" ? 1 : 0})`}
			mb="6"
			alt="ielts_img"
		/>

		<VStack alignItems="stretch">
			{
				g.questions.map((question) => (
					<Question key={question.num} question={getQuestion(question.num)} options={g.labels} />
				))
			}
		</VStack>
	</VStack>
}


export function SentenceMatching({ children: g }: { children: SentenceMatchingGroup }) {

	const [selected, setSelected] = useState<Record<string, number>>({})
	const getQuestion = useModuleStore((state) => state.getQuestion)

	return <VStack alignItems="start">

		<VStack alignItems="stretch" ms="auto" border="md" p="6" borderStyle="groove" shadow="lg" borderRadius="md" mb="8">
			<Center fontWeight="bold">{g.sentences_title}</Center>
			{
				Object.keys(g.sentences).map(key =>
					<HStack
						key={key}
						bg={selected[key] ? "bg.emphasized" : "none"}
						mx="0"
						px="6"
					>
						<Text fontWeight="bold" fontFamily="mono" fontSize="lg">{key}</Text>
						<Text>{g.sentences[key]}</Text>
					</HStack>)
			}
		</VStack>

		<VStack alignItems="stretch">
			{
				g.questions.map((question) => (
					<Question
						key={question.num}
						question={getQuestion(question.num)}
						options={Object.keys(g.sentences)}
						onChange={(e) => {
							const value = e.currentTarget.value
							setSelected(prev => {
								let new_state = Object.fromEntries(Object.entries(prev).filter(([, val]) => val !== question.num))
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



export function IdentifyInfoGroup({ children: group }: { children: IdentifyInfoGroup }) {
	const getQuestion = useModuleStore((state) => state.getQuestion)

	return <VStack alignItems="start">

		<VStack alignItems="start" mb="10">
			<Text>{group.options_prompt}</Text>
			<Table.Root ms="6">
				<Table.Body>
					{
						group.options.map((option, i) => (
							<Table.Row key={option}>
								<Table.Cell fontWeight="bold">{option}</Table.Cell>
								<Table.Cell>{group.option_descriptions[i]}</Table.Cell>
							</Table.Row>
						))
					}
				</Table.Body>
			</Table.Root>
		</VStack>

		<VStack alignItems="stretch">
			{
				group.questions.map((question) => (
					<Question key={question.num} question={getQuestion(question.num)} options={group.options} />
				))
			}
		</VStack>
	</VStack>
}


export function ParagraphMatchingGroup({ children: group }: { children: ParagraphMatchingGroup }) {
	const module1 = useModuleStore((state) => state.module)
	const getQuestion = useModuleStore((state) => state.getQuestion)

	const part = useModuleStore((state) => state.part)
	const content = module1.content as ReadingContent

	const labels: string[] = []
	content.parts[part].passage.sections.forEach((section) => labels.push(section.label ?? ""))

	return <VStack alignItems="start">

		<VStack alignItems="stretch">
			{
				group.questions.map((question) => (
					<Question key={question.num} question={getQuestion(question.num)} options={labels} />
				))
			}
		</VStack>
	</VStack>
}