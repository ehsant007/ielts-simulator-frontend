"use client"

import type { ListeningContent, Question, ReadingContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Wrap, Button, VStack, HStack, Icon, Collapsible, Group, SegmentGroup, useBreakpointValue, Box } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { useState } from "react";



export function QuestionNav() {
	const moduleType = useModuleStore((state) => state.module.type)

	switch (moduleType) {
		case "listening":
		case "reading":
			return <ListeningReadingQuestionNav />
		case "writing":
			return <WritingTaskNav />
		case "speaking":
			return null
	}
}


export function WritingTaskNav() {
	const task_i = useModuleStore((state) => state.task)
	const setTask = useModuleStore((state) => state.setTask)

	return (
		<HStack>
			<SegmentGroup.Root
				mx="auto"
				value={`${task_i}`}
			>
				<SegmentGroup.Indicator />
				{
					[0, 1].map((task) =>
						<SegmentGroup.Item
							cursor="pointer"
							value={`${task}`}
							key={task}
							onClick={() => setTask(task)}
						>
							Task {task + 1}
						</SegmentGroup.Item>
					)
				}

			</SegmentGroup.Root>
		</HStack>
	)
}

export function ListeningReadingQuestionNav() {
	const module1 = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)
	const [navExpand, setNavExpand] = useState(true)
	const part_i = useModuleStore((state) => state.part)
	const content = module1.content as (ListeningContent | ReadingContent)
	const isMobile = useBreakpointValue({ base: true, md: false, })

	return (
		<VStack width="full">

			<Wrap width="full" maxW="5xl">

				{!isMobile && (
					<>
						<Group visibility="hidden">
							<Button
								size="xs">
								<HiArrowLeft />
							</Button>

							<Button
								size="xs">
								<HiArrowRight />
							</Button>
						</Group>

						<Button
							visibility="hidden"
							size="xs"
						>
							<Icon> <BiExpand /> </Icon>
						</Button>
					</>
				)
				}
				<Box ms="auto">
					<SegmentGroup.Root
						size="sm"
						value={`${part_i}`}
					>
						<SegmentGroup.Indicator />
						{
							content.parts.map((part, pi) =>
								<SegmentGroup.Item
									cursor="pointer"
									value={`${pi}`}
									key={pi}
									onClick={() => focusQuestion(part.test[0].questions[0].num)}
									fontWeight="semibold"
								>
									Part {pi + 1}
								</SegmentGroup.Item>
							)
						}
					</SegmentGroup.Root>
				</Box>

				<Group ms="auto" me="5" p="0" alignItems="start">
					<Button
						onClick={focusPrevQuestion}
						variant="outline"
						size="xs"
					>
						<HiArrowLeft />
					</Button>

					<Button
						onClick={focusNextQuestion}
						variant="outline"
						size="xs"
					>
						<HiArrowRight />
					</Button>
				</Group>

			
					<Button
						size="xs"
						variant="outline"
						p="0"
						onClick={() => setNavExpand(prev => !prev)}
					>
						<Icon>{navExpand ? <BiCollapse /> : <BiExpand />}</Icon>
					</Button>

			</Wrap>

			<Collapsible.Root open={navExpand}>
				<Collapsible.Content>
					<Wrap justify="center">
						{isMobile ?
							content.parts.map((part) => part.test.map((g) => g.questions.map((q) =>
								<QuestionNavButton key={q.num} question={q} />
							)))

							:

							content.parts.map((part, part_i) => <Wrap gap="0.5" key={part_i}>
								<Button
									key={part_i}
									size="xs"
									variant="ghost"
									onPointerUp={() => focusQuestion(part.test[0].questions[0].num)}
								>
									Part {part_i + 1}
								</Button>
								{
									part.test.map((g) =>
										g.questions.map((q) => <QuestionNavButton key={q.num} question={q} />)
									)
								}
							</Wrap>)
						}
					</Wrap>
				</Collapsible.Content>
			</Collapsible.Root>

		</VStack >
	)
}


export function QuestionNavButton({ question }: { question: Question }) {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const result = useModuleStore((state) => state.result[question.num]) ?? []
	const answer = useModuleStore((state) => state.answers[question.num]) ?? []
	const mode = useModuleStore((state) => state.mode)

	let props = {}
	if (mode === "test") {
		props = answer?.[0]
			? { colorPalette: "purple" }
			: {}
	} else {

		props = result.includes(0)
			? { colorPalette: "red" }
			: result.includes(1)
				? { colorPalette: "green" }
				: {}
	}

	return (
		<Button
			key={question.num}
			size="xs"
			variant="outline"
			onPointerUp={() => focusQuestion(question.num)}
			fontFamily="mono"
			fontWeight="semibold"
			{...props}
		>
			{question.to_num ? `${question.num} | ${question.to_num}` : question.num}
		</Button>
	)
}
