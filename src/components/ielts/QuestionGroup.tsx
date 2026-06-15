"use client"

import type { QuestionGroupBase, NoteCompletionGroup, QuestionGroup, VisualLabelingGroup, SentenceMatchingGroup, IdentifyInfoGroup, ParagraphMatchingGroup, ReadingContent } from "@/client";
import { Content, MD } from "./Content";
import { Question } from "./Question";
import { Box, VStack, Text, HStack, Image, Table, Wrap } from "@chakra-ui/react";
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { useColorMode } from "../ui/color-mode";
import { useCallback, useEffect, useState } from "react";
import { getModuleFile } from "./utils";
import { useDraggable, DragDropProvider, useDroppable } from '@dnd-kit/react';
import { QuestionGroupProvider } from "./QuestionGroupProvider";

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

	return (
		<QuestionGroupProvider group={g}>
			<VStack alignItems="start">
				<Text fontStyle="italic" fontWeight="bold">
					Questions {g.question_range?.[0]}-{g.question_range?.[1]}
				</Text>
				{g.prompt &&
					<Box mb="4" fontStyle="italic">
						<MD id={`qg${g.question_range[0]}-${g.question_range[1]}-prompt`}>{g.prompt}</MD>
					</Box>
				}

				<Box
					width="full"
					p="3"
				>
					{ui}
				</Box>
			</VStack>
		</QuestionGroupProvider>
	)
}

export function NoteCompletion({ g }: { g: NoteCompletionGroup }) {
	const pi = useModuleStore((state) => state.part)

	return (
		<Box p="3">
			<Content
				id={`part${pi}-nc-qg${g.question_range[0]}-${g.question_range[1]}`}
				content={g.content}
			/>
		</Box>
	)
}


export function NoteCompletionWithOptions({ g }: { g: NoteCompletionGroup }) {
	const pi = useModuleStore((state) => state.part)
	const store = useModuleStoreApi()
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)

	const [selected, setSelected] = useState<Record<number, string | undefined>>({})
	const select = useCallback((questionNum: number, option: string) => {
		setAnswer(questionNum, [option])
		setSelected(prev => ({ ...prev, [questionNum]: option }))
	}, [setAnswer])

	const deselect = (questionNum: number) => {
		setAnswer(questionNum, [""])
		setSelected(prev => ({ ...prev, [questionNum]: undefined }))
	}

	const swap = (qNum1: number, qNum2: number) => {
		const answers = store.getState().answers
		const temp = answers[qNum1]
		setAnswer(qNum1, answers[qNum2])
		setAnswer(qNum2, temp)
	}

	useEffect(() => {
		g.questions.forEach((q) => {
			const answers = store.getState().answers
			if (answers[q.num])
				select(q.num, answers[q.num][0])
		})
	}, [g.questions, select, store])


	// Draggable Option
	function Option({ children: option }: { children: string }) {
		const { ref } = useDraggable({ id: option, type: "option" });

		const isSelected = Object.values(selected).includes(option)

		return (
			<Box
				shadow="md"
			>
				<Text
					ref={ref}
					cursor="pointer"
					px="3"
					py="2"
					bg={isSelected ? "transparent" : "bg"}
					border="md"
					borderColor={isSelected ? "transparent" : "fg.subtle"}
					color={isSelected ? "fg.muted" : "fg"}
				>
					{option}
				</Text>

			</Box>
		)
	}

	// Options Area
	function OptionsArea() {
		const { ref } = useDroppable({ id: g.question_range.join("-"), type: "options-area", accept: ["question"] });
		return (
			<Wrap
				p="6"
				mb="10"
				justifyContent="center"
				border="md"
				borderColor="fg.subtle"
				ref={ref}
			>
				{
					g.options?.map((option) => (

						<Option key={option}>{option}</Option>
					)
					)
				}
			</Wrap>
		)
	}

	return (
		<DragDropProvider
			onDragEnd={(event) => {
				if (event.canceled)
					return;

				const { target, source } = event.operation;

				if (!target || !source)
					return

				if (target.type === "question") {
					const targetQuestionNum = Number(target.id)

					if (source.type === "option")
						select(targetQuestionNum, source.id.toString())
					else if (source.type == "question") {
						const sourceQuestionNum = Number(source.id)
						swap(targetQuestionNum, sourceQuestionNum)
					}
				}

				if (target.type === "options-area") {
					const sourceQuestionNum = Number(source.id)
					deselect(sourceQuestionNum)
				}
			}}

			onDragOver={(event) => {
				const { target, source } = event.operation;

				if (!target || !source)
					return

				if (target.type === "options-area")
					return

				const qNum = Number(target.id)
				focusQuestion(qNum)
			}}
		>

			<Box p="3">
				<OptionsArea />
				<Content
					id={`part${pi}-nc-qg${g.question_range[0]}-${g.question_range[1]}`}
					content={g.content}
				/>
			</Box>

		</DragDropProvider>
	)
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

	return (
		<VStack alignItems="start">

			<VStack
				alignItems="start"
				justifySelf="center"
				mb="8"
				p="6"
				border="md"
				borderStyle="groove"
				borderColor="fg.subtle"
				shadow="lg"
				borderRadius="md"
			>
				<Text fontWeight="bold" mx="auto">{g.sentences_title}</Text>
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
	)
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
							<Table.Row key={option} bg="none">
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
